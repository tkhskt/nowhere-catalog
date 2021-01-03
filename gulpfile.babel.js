import gulp from 'gulp';
import sass from 'gulp-sass';
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import gulpWebpack from 'webpack-stream';
import webpack from 'webpack';
import plumber from 'gulp-plumber';
import browserSync from 'browser-sync';
import webpackConfig from './webpack.config';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';

const bs = browserSync.create();

// FIXME gulp.taskのタスク定義のやり方は古いらしい

const srcDir = 'src';
const dstDir = './dist/assets';

gulp.task('copy', () => {
  return gulp
    .src(srcDir + '/index.html')
    .pipe(plumber())
    .pipe(gulp.dest('dist'))
    .pipe(bs.stream());
});

// sassをコンパイルしてcss圧縮
gulp.task('sass', () => {
  return gulp
    .src('./src/assets/sass/**/*.scss', {
      base: './src/assets/sass',
      sourcemaps: true,
    })
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err.messageFormatted);
          this.emit('end');
        },
      })
    )
    .pipe(sass({ outputStyle: 'compressed' })) // 圧縮
    .pipe(
      postcss([
        autoprefixer({
          cascade: false,
        }),
      ])
    )
    .pipe(
      gulp.dest(dstDir + '/css', {
        sourcemaps: true,
      })
    )
    .pipe(bs.stream());
});

gulp.task('favicon', () => {
  return gulp
    .src(srcDir + '/static/*.+(png|svg|webmanifest|ico|xml)')
    .pipe(plumber())
    .pipe(gulp.dest('dist'))
    .pipe(bs.stream());
});

// vertをコピー
gulp.task('vert', () => {
  return gulp
    .src('./src/assets/glsl/**/*.vert', {
      base: './src/assets/glsl',
    })
    .pipe(plumber())
    .pipe(gulp.dest(dstDir + '/glsl'))
    .pipe(bs.stream());
});

// vertをコピー
gulp.task('frag', () => {
  return gulp
    .src('./src/assets/glsl/**/*.frag', {
      base: './src/assets/glsl',
    })
    .pipe(plumber())
    .pipe(gulp.dest(dstDir + '/glsl'))
    .pipe(bs.stream());
});

gulp.task('font', () => {
  return gulp
    .src('./src/assets/font/*.ttf', {
      base: './src/assets/font',
    })
    .pipe(plumber())
    .pipe(gulp.dest(dstDir + '/font'))
    .pipe(bs.stream());
});

// いろんな拡張子を圧縮するためのオプション
const imageminOption = [
  pngquant({ speed: 1 }),
  imagemin.gifsicle({
    interlaced: false,
    optimizationLevel: 1,
    colors: 256,
  }),
  imagemin.optipng(),
  imagemin.svgo(),
];

// 画像圧縮
gulp.task('imagemin', () => {
  const srcGlob = srcDir + '/assets/img/*.+(jpg|jpeg|png|gif|svg)'; // 元画像
  const dstGlob = dstDir + '/img'; // 圧縮先
  return gulp.src(srcGlob).pipe(plumber()).pipe(imagemin(imageminOption)).pipe(gulp.dest(dstGlob));
});

gulp.task('webpack', () => {
  return gulpWebpack(webpackConfig(), webpack)
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err.messageFormatted);
          this.emit('end');
        },
      })
    )
    .pipe(gulp.dest(dstDir + '/js'));
});

gulp.task('reload', (done) => {
  browserSync.reload();
  done();
});

// ファイル監視(doneする)
gulp.task('watch', (done) => {
  gulp.watch('./src/assets/sass/**/*.scss', gulp.task('sass'));
  gulp.watch('./src/assets/glsl/*', gulp.series('frag', 'vert', 'webpack'));
  gulp.watch('./src/assets/js/*.js', gulp.task('webpack'));
  gulp.watch('./src/index.html', gulp.series('copy', 'reload'));
  done();
});

gulp.task(
  'build',
  gulp.series('sass', 'frag', 'vert', 'font', 'imagemin', 'webpack', 'copy', 'favicon')
);

// サーバー立ち上げ(doneするとerror)
gulp.task('serve', () => {
  bs.init({
    server: './dist',
  });
});

// webpack追加
gulp.task(
  'default',
  gulp.series(
    'sass',
    'vert',
    'frag',
    'font',
    'imagemin',
    'webpack',
    'copy',
    'watch',
    'serve',
    function (done) {
      done();
    }
  )
);
