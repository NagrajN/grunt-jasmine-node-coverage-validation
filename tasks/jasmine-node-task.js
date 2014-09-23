module.exports = function (grunt) {

    'use strict';
    var isVerbose;

    var doCoverage = function (opts, projectRoot, runFn) {
        // debugger;
        var istanbul = require('istanbul'),
            Path = require('path'),
            mkdirp = require('mkdirp'),
            fs = require('fs'),
            glob = require('glob'),
            checkCoverage = require('./CheckCoverage.js');

        // set up require hooks to instrument files as they are required
        var DEFAULT_REPORT_FORMAT = 'lcov';
        var Report = istanbul.Report;
        var reports = [];
        var savePath = opts.savePath || 'coverage';
        var reportingDir = Path.resolve(process.cwd(), savePath);
        mkdirp.sync(reportingDir); //ensure we fail early if we cannot do this
        var reportClassNames = opts.report || [DEFAULT_REPORT_FORMAT];
        reportClassNames.forEach(function(reportClassName) {
            reports.push(Report.create(reportClassName, { dir: reportingDir }));
        });
        if (opts.print !== 'none') {
            switch (opts.print) {
                case 'detail':
                    reports.push(Report.create('text'));
                    break;
                case 'both':
                    reports.push(Report.create('text'));
                    reports.push(Report.create('text-summary'));
                    break;
                default:
                    reports.push(Report.create('text-summary'));
                    break;
            }
        }

        var excludes = opts.excludes || [];
        excludes.push('**/node_modules/**');

        istanbul.
            matcherFor({
                root: projectRoot || process.cwd(),
                includes: [ '**/*.js' ],
                excludes: excludes
            },
            function (err, matchFn) {
                if (err) {
                    return matchFn(err);
                }

                var coverageVar = '$$cov_' + new Date().getTime() + '$$',
                    instrumenter = new istanbul.Instrumenter({ coverageVariable: coverageVar }),
                    transformer = instrumenter.instrumentSync.bind(instrumenter),
                    hookOpts = { verbose: isVerbose };

                istanbul.hook.hookRequire(matchFn, transformer, hookOpts);

                //initialize the global variable to stop mocha from complaining about leaks
                global[coverageVar] = {};

                process.once('exit', function () {
                    var file = Path.resolve(reportingDir, 'coverage.json'),
                        collector,
                        cov;
                    if (typeof global[coverageVar] === 'undefined' || Object.keys(global[coverageVar]).length === 0) {
                        grunt.log.error('No coverage information was collected, exit without writing coverage information');
                        return;
                    } else {
                        cov = global[coverageVar];
                    }
                    //important: there is no event loop at this point
                    //everything that happens in this exit handler MUST be synchronous
                    mkdirp.sync(reportingDir); //yes, do this again since some test runners could clean the dir initially created
                    if (opts.print !== 'none') {
                        grunt.log.error('=============================================================================');
                        grunt.log.error('Writing coverage object [' + file + ']');
                    }
                    fs.writeFileSync(file, JSON.stringify(cov), 'utf8');
                    collector = new istanbul.Collector();
                    if(opts.collect != null) {
                        opts.collect.forEach(function(covPattern) {
                            var coverageFiles = glob.sync(covPattern, null);
                            coverageFiles.forEach(function(coverageFile) {
                                var contents = fs.readFileSync(coverageFile, 'utf8');
                                var fileCov = JSON.parse(contents);
                                if(opts.relativize) {
                                    var cwd = process.cwd();
                                    var newFileCov = {};
                                    for(var key in fileCov) {
                                        var item = fileCov[key];
                                        var path = item.path;
                                        var relPath = Path.relative(cwd, path);
                                        item.path = relPath;
                                        newFileCov[relPath] = item;
                                    }
                                    fileCov = newFileCov;
                                }
                                collector.add(fileCov);
                            });
                        });
                    }
                    else {
                        collector.add(cov);

                    }
                    if (opts.print !== 'none') {
                        grunt.log.error('Writing coverage reports at [' + reportingDir + ']');
                        grunt.log.error('=============================================================================');
                    }
                    reports.forEach(function (report) {
                        report.writeReport(collector, true);
                    });

                    //Added check for summarized coverage
                    var summary = istanbul.utils.summarizeCoverage(cov);

                    if (!checkCoverage(summary, opts.options)) {
                         grunt.log.error('\n================================Coverage Warning =================================');
                         grunt.warn('Code Coverage is less than what is configured. \nTask Options:' + JSON.stringify(opts.options) + "\n");
                    }

                });
                runFn();
            });

    };

    grunt.registerMultiTask("jasmine_node", "Runs jasmine-node with istanbul coverage", function () {
        var jasmine = require('jasmine-node');
        var _ = require("underscore");

        // This is an async task
        var done = this.async();

        // default options
        var options = {
            forceExit: false,
            match: '.*',
            matchall: false,
            specNameMatcher: 'spec',
            helperNameMatcher: 'helpers',
            extensions: 'js',
            useHelpers: false,
            coverage: false,
            isVerbose: true,
            showColors: false,
            specFolders: [],
        };
        // overwrite defaults with grunt config options
        _.extend(options, this.options());
        var regexStr = options.match + (options.matchall ? "" : options.specNameMatcher + "\\.") + "(" + options.extensions + ")$";
        grunt.log.debug("regex: " + regexStr);
        options.regExpSpec = new RegExp(regexStr, 'i');

        // target src files are used as spec search directories
        this.files.forEach(function(f) {
            grunt.log.debug(JSON.stringify(f));
            Array.prototype.push.apply(options.specFolders, f.src);
        });
        if (options.specFolders.length === 0) { options.specFolders = [ "." ]; }

        var onComplete = function (runner, log) {
            var exitCode;
            grunt.log.writeln("");

            if (runner.results().failedCount === 0) {
                exitCode = 0;
            } else {
                exitCode = 1;
            }

            if (options.forceExit) {
                process.exit(exitCode);
            }
            done(exitCode === 0);
        };

        var runFn = function () {

            if (options.useHelpers) {
                var helperRegex = new RegExp(options.helperNameMatcher + "?\\.(" + options.extensions + ")$", 'i');
                jasmine.loadHelpersInFolder('.', helperRegex);
            }

            try {
                // since jasmine-node@1.0.28 an options object need to be passed
                jasmine.executeSpecsInFolder(options);
            } catch (e) {
                grunt.log.error('Failed to execute "jasmine.executeSpecsInFolder": ' + e.stack);
            }

        };

        if (options.coverage) {
            doCoverage(options.coverage, '.', runFn);
        } else {
            runFn();
        }
    });
};
