var gulp = require("gulp");
var shell = require("gulp-shell");
var runSequence = require("run-sequence");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var minifyHTML = require("gulp-htmlmin");
var purgecss = require("gulp-purgecss");

var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");
var jpegtran = require("imagemin-jpegtran");
var gifsicle = require("imagemin-gifsicle");
var replace = require("gulp-replace");
var fs = require("fs");

gulp.task("jekyll", shell.task("jekyll build"));

gulp.task("optimize-images", function() {
  return gulp
    .src([
      "_site/**/*.jpg",
      "_site/**/*.jpeg",
      "_site/**/*.gif",
      "_site/**/*.png"
    ])
    .pipe(
      imagemin({
        progressive: false,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant(), jpegtran(), gifsicle()]
      })
    )
    .pipe(gulp.dest("_site/"));
});

gulp.task("purgecss", () => {
  return gulp
    .src("_site/css/main.css")
    .pipe(
      purgecss({
        content: ["_site/**/*.html"]
      })
    )
    .pipe(gulp.dest("_site/css/"));
});

gulp.task("optimize-css", function() {
  var plugins = [autoprefixer({ browsers: ["last 1 version"] }), cssnano()];
  return gulp
    .src("_site/css/main.css")
    .pipe(postcss(plugins))
    .pipe(gulp.dest("_site/css/"));
});

gulp.task("optimize-html", function() {
  return gulp
    .src("_site/**/*.html")
    .pipe(minifyHTML({ collapseWhitespace: true }))
    .pipe(
      replace(/<link href=\"\/css\/main.css\"[^>]*>/, function(s) {
        var style = fs.readFileSync("_site/css/main.css", "utf8");
        return "<style>\n" + style + "\n</style>";
      })
    )
    .pipe(gulp.dest("_site/"));
});

gulp.task("deploy", function(callback) {
  runSequence(
    "jekyll",
    "optimize-images",
    "purgecss",
    "optimize-css",
    "optimize-html",
    callback
  );
});
