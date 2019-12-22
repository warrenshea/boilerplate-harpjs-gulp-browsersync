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

const browserSyncReload = (done) => {
  reload();
}

const clean = (done) => {
  if (process.env.NODE_ENV === 'production') {
    return del([
      '_dist/*',
      '_dist/**/*'
    ]);
  } else {
    done();
  }
}

const css = (done) => {
  if (process.env.NODE_ENV === 'development') {
    return gulp.src(['./_dev/resources/stylesheets/**/*.scss'])
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
      /*.pipe(cleanCSS({
        //Remove comments and minify
        level: {
          1: {specialComments: 0}
        }}))*/
      .pipe(gulp.dest('./_dev/resources/stylesheets'))
      .pipe(reload({stream: true}));
  } else {
    return gulp.src(['./_dev/resources/stylesheets/**/*.scss'])
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
      .pipe(cleanCSS({
        //Remove comments and minify
        level: {
          1: {specialComments: 0}
        }}))
      .pipe(gulp.dest('./_dist/resources/stylesheets'));
  }
}

const js = (done) => {
  if (process.env.NODE_ENV === 'development') {
    return gulp.src(['./_dev/resources/scripts/**/*.js'])
      .pipe(reload({stream: true}));
  } else {
    return gulp.src(['./_dev/resources/scripts/**/*.js'])
      .pipe(babel({"presets": ['es2015']}))
      //.pipe(uglify()) //Minify
      .pipe(gulp.dest('./_dist/resources/scripts'));
    return;
  }
}

const images = () => {
  return gulp.src('./_dev/assets/images/**/*')
    .pipe(gulp.dest('./_dist/assets/images/'))
    .on('error', function(e){console.log("ERROR 2",e);});
}

const html = (done) => {
  if (process.env.NODE_ENV === 'development') {
    browserSyncReload();
  }
  done();
}

const watchFiles = () => {
  gulp.watch(['./_dev/resources/stylesheets/*.scss', './_dev/resources/stylesheets/**/*.scss','./_dev/style-guide/**/*.css'], css);
  gulp.watch(['./_dev/resources/scripts/*.js', './_dev/resources/scripts/**/*.js',,'./_dev/style-guide/**/*.js'], js);
  gulp.watch('./_dev/**/*.ejs', html);
}

const devSetEnv = (done) => {
  process.env.NODE_ENV = 'development';
  console.log("Environment: ",process.env.NODE_ENV);
  done();
}

const prodSetEnv = (done) => {
  process.env.NODE_ENV = 'production';
  console.log("Environment: ",process.env.NODE_ENV);
  done();
}

const serve = (done) => {
  harp.server(__dirname + "/_dev", {
    port: 9100
  }, function (done){
    browserSync({
      proxy: "localhost:9100",
      open: true,
      startPath: '/'
    });
  });
  done();
}

const build = (done) => {
  exec('npm run compile', function(err, stdout, stderr) {
    //console.log(stdout);
    //console.log(stderr);
    css();
    js();
    console.log("Build completed!");
  });
  done();
}

/* This won't work, build will override css and js. Moved CSS and JS to Callback of Build
This is unique to HarpJS and how the folder code is structured
const defaultProd = gulp.series(prodSetEnv, clean, build, css, js);*/
const defaultProd = gulp.series(prodSetEnv, clean, build);

const defaultDev = gulp.series(devSetEnv, gulp.parallel(serve, css, js, html, watchFiles));

exports.default = (argv.prod === true) ? defaultProd : defaultDev;