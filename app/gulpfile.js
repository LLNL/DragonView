/**
 * Created by yarden on 5/25/16.
 */

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var exec = require('child_process').exec;

// Compile and automatically prefix stylesheets
gulp.task('sass', function () {
  return gulp.src([
    'styles/**/*.scss', '!styles/**/_*.scss'
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({precision: 10}).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['last 2 versions'], cascade: false}))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('styles'));
});

gulp.task('build', function(cb) {
  exec('jspm build cg - d3 - css - cg-core build/cg.js --format umd  --skip-rollup --dev', function(err) {
    console.log('jspm build ', err || '');
    if (err) return cb(err);
    cb();
  });
});

gulp.task('dist', ['sass'], function(cb) {
  exec('jspm build cg dist/cg.js --format umd', function(err) {
    console.log('jspm dist ', err || '');
    if (err) return cb(err);
    cb();
  });
});


gulp.task('watch', ['sass'], function () {
  gulp.watch('styles/**/*.scss', ['sass'])
});

gulp.task('default', ['sass']);