"use strict";

var gulp = require('gulp'),
  babel = require('gulp-babel'),
  plumber = require('gulp-plumber'),
  jade = require('gulp-jade'),

path = {
  src: {
    js: 'src/**/*.js',
    views: 'src/views/*.jade',
    data: 'src/data/**/*.*'
  },
  dist: {
    js: 'dist/',
    views: 'dist/',
    data: 'dist/data/'
  }
};

gulp.task('views', function() {
  gulp.src(path.src.views)
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest( path.dist.views ))
})
gulp.task('6to5', function() {
  gulp.src(path.src.js)
    .pipe(plumber())
    .pipe(babel())
    .pipe(plumber.stop())
    .pipe(gulp.dest(path.dist.js));
});
gulp.task('data', function() {
  gulp.src(path.src.data)
    .pipe(gulp.dest(path.dist.data))
})
gulp.task('watch', ['6to5', 'views', 'data'], function() {
  gulp.watch(path.src.js, ['6to5']);
  gulp.watch(path.src.views, ['views']);
  gulp.watch(path.src.data, ['data']);
});

gulp.task('default', ['watch']);