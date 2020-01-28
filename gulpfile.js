"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var del = require("del");
var htmlmin = require("gulp-htmlmin");

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {  //задачи
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",  // копирую задачи
    "source/img/**",
    "source/js/**",
    "source/*.ico"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")  //берутся из папки
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),  // оптимизую
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.svgo()
  ]))
  // .pipe(gulp.dest("source/img"));
  .pipe(gulp.dest("build/img"));  //  копирую в build
})

gulp.task("webp", function() {
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality: 90}))
  // .pipe(gulp.dest("source/img"));
  .pipe(gulp.dest("build/img"));
});

gulp.task("html", function() {
  return gulp.src("source/*.html")
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest("build"));
});

gulp.task("html", function() {
  return gulp.src("source/*.html")
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/*.html", gulp.series("html", "refresh")).on("change", server.reload);
});

gulp.task("refresh", function(done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series("clean", "copy", "css", "html", "webp", "images"));
gulp.task("start", gulp.series("build", "server"));
