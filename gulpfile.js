"use strict";

var gulp = require('gulp'),
  babel = require('gulp-babel'),
  plumber = require('gulp-plumber'),
  jade = require('gulp-jade'),
  webpack = require('gulp-webpack'),
  notify = require('gulp-notify'),

path = {
  src: {
    js: 'src/scripts/**/*.js',
    views: 'src/views/*.jade',
    data: 'src/data/**/*.*',
    webpack: 'dist/scripts/bet.js'
  },
  dist: {
    js: 'dist/scripts/',
    views: 'dist/',
    data: 'dist/data/',
    webpack: 'dist/scripts/'
  }
};

gulp.task('views', function() {
  gulp.src(path.src.views)
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest( path.dist.views ))
})
gulp.task('webpack', ['6to5'], function() {
  gulp.src(path.src.webpack)
    .pipe(webpack({
      output: {
        filename: '[name].js'
      }
    }))
    .pipe(gulp.dest( path.dist.webpack ))

})
gulp.task('6to5', function() {
  gulp.src(path.src.js)
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(babel())
    .pipe(plumber.stop())
    .pipe(gulp.dest(path.dist.js));
});

gulp.task('data', function() {
  gulp.src(path.src.data)
    .pipe(gulp.dest(path.dist.data))
})
gulp.task('watch', ['webpack', 'views', 'data'], function() {
  gulp.watch(path.src.js, ['webpack']);
  gulp.watch(path.src.views, ['views']);
  gulp.watch(path.src.data, ['data']);
});

gulp.task('default', ['watch']);