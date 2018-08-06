'use strict';

const gulp = require('gulp'),

      //CSS
      sass = require('gulp-sass'),
      cleanCSS = require('gulp-clean-css'),

      //JavaScript
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify'),
      
      //Helpers
      harp = require('harp'),
      exec = require('child_process').exec,
      autoprefixer = require('gulp-autoprefixer'),
      browserSync = require('browser-sync'),
      reload = browserSync.reload,
      argv = require('yargs').argv,
      del = require('del');

gulp.task('css', () => {
  if (process.env.NODE_ENV === 'development') {
    return gulp.src('./_dev/resources/stylesheets/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(gulp.dest('./_dev/resources/stylesheets'))
    .pipe(reload({stream: true}))
  } else {
    return gulp.src('./_dev/resources/stylesheets/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./_dist/resources/stylesheets'))
  }
});

gulp.task('js', () => {
  if (process.env.NODE_ENV === 'development') {
    return gulp.src('./_dev/resources/scripts/**/*.js')
      .pipe(babel({
        compact: false,
        presets: ['es2015']
      }))
      .pipe(reload({stream: true}))
  } else {
    return gulp.src('./_dev/resources/scripts/**/*.js')
      .pipe(babel({
        compact: false,
        presets: ['es2015']
      }))
      .pipe(uglify())
      .pipe(gulp.dest('./_dist/resources/scripts'))
  }  
});

gulp.task('html', function() {
  if (process.env.NODE_ENV === 'development') {
    return browserSync.reload();
  }
});

gulp.task('watch', function() {
  gulp.watch('./_dev/resources/stylesheets/*.scss', ['css']);
  gulp.watch('./_dev/resources/scripts/*.js', ['js']);
  gulp.watch('./_dev/**/*.ejs', ['html']);
});

gulp.task('dev-set-env', function () {
  return process.env.NODE_ENV = 'development';
});

gulp.task('serve', function (done) {
  console.log("Environment: ",process.env.NODE_ENV);
  harp.server(__dirname + "/_dev", {
    port: 9100
  }, function (done){
    browserSync({
      proxy: "localhost:9100",
      open: true,
      startPath: '/'
    });
  });
});

gulp.task('prod-set-env', function () {
  return process.env.NODE_ENV = 'production';
});

gulp.task('build', ['prod-set-env'], () => {
  console.log("Environment: ",process.env.NODE_ENV);
  exec('npm run compile', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
});

gulp.task('default', (argv.prod === true) ? ['prod-set-env','build','css','js'] : ['dev-set-env','serve','css','js','html','watch']);
