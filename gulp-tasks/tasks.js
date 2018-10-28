var gulp            = require('gulp'),
    plumber         = require('gulp-plumber'),
    rename          = require('gulp-rename');
var autoprefixer    = require('gulp-autoprefixer');
var babel           = require('gulp-babel');
var typescript      = require('typescript');
var ts              = require('gulp-typescript');
var concat          = require('gulp-concat');
var uglify          = require('gulp-uglify');
var iconfont        = require('gulp-iconfont');
var iconfontCss     = require('gulp-iconfont-css');
var spritesmith     = require('gulp.spritesmith');
var merge           = require('merge-stream');
var csso            = require('gulp-csso');
var consolidate     = require('gulp-consolidate');
var imagemin        = require('gulp-imagemin'),
    cache           = require('gulp-cache');
var minifycss       = require('gulp-minify-css');
var cleanCSS        = require('gulp-clean-css');
var sass            = require('gulp-sass');
var browserSync     = require('browser-sync');
browserSync.create();
var browserify      = require('browserify');
var buffer          = require('vinyl-buffer');
var source          = require('vinyl-source-stream');
var header          = require('gulp-header');
var pug             = require('gulp-pug');
var bower           = require('gulp-bower');

// PATH
const bower_folder      = 'bower_components';
const dist_assets       = 'dist/assets';
const src_assets        = 'src/assets';
const src_vendor        = src_assets+'/vendor';
const src_pages         = 'src/pages';
const src_blocks        = src_pages+'/components';
const src_layouts       = src_pages+'/layouts';
const src_webcomponents = '../src';

// NAMES
const fontName      = 'iconfont-2.0';
const cssClass      = 'icon';

const autoprefixer_options = {
    browsers: ["> 0%"],
    cascade: false
};


// ************************************************
// TASKS ******************************************
// ************************************************

// Deplace "Bower components" TO "vendor" folder
gulp.task('bower', function() {
    return bower('./'+bower_folder)
        .pipe(gulp.dest('./'+src_assets+'/vendor'))
        .pipe(gulp.dest('./'+dist_assets+'/vendor'));
});


gulp.task('browser-sync', function() {
    browserSync({
        server: {baseDir: "./dist"},
        directory: true,
        open: false,
        stream: false
    });
});

gulp.task('bs-reload', function() {
    browserSync.reload();
});


// ************************************************
// IMAGES *****************************************
// ************************************************
gulp.task('images', function() {
    gulp.src(src_assets+'/img/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest(dist_assets+'/img'));
});

// ************************************************
// SPRITES ****************************************
// ************************************************
gulp.task('sprites-scss', function() {
    var spriteData = gulp.src(src_assets+'/img/sprites/*.png')
        .pipe(spritesmith({
            imgName: 'icon-sprite.png',
            imgPath: '../img/sprites/icon-sprite.png',
            cssName: '_sprites.scss',
            cssFormat: 'css',
            cssOpts: {
                cssSelector: function(item) {
                    if (item.name.indexOf('-hover') !== -1) {
                        return '.icon-' + item.name.replace('-hover', ':hover');
                    }
                    else {
                        return '.icon-' + item.name;
                    }
                }
            }
        }));
    var imgStream = spriteData.img
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest(dist_assets+'/img/sprites/'));
    var cssStream = spriteData.css
        .pipe(gulp.dest(src_assets+'/scss/sprites/'));
    return merge(imgStream, cssStream);
});

// ************************************************
// FONTS ******************************************
// ************************************************
gulp.task('fonts', () => {
    return gulp.src(src_assets+'/assets/fonts/*')
        .pipe(gulp.dest(dist_assets+'/fonts'));
});

// ************************************************
// ICONFONT ***************************************
// ************************************************
    // S A S S
gulp.task('iconfont', function() {
    /*gulp.src([src_assets+'/icons/*.svg'])
        .pipe(iconfontCss({
            fontName:   fontName,
            cssClass:   cssClass,
            path:       src_assets+'/scss/templates/_icons.scss',
            targetPath: '../../scss/_icons.scss',
            fontPath:   '../fonts/iconfont/'
        }))
        .pipe(iconfont({
            fontName:   fontName,
            formats:    ['svg','ttf','eot','woff','woff2']
        }))
        .pipe(gulp.dest(src_assets+'/fonts/iconfont/'))
        .pipe(gulp.dest(dist_assets+'/fonts/iconfont/'));*/

    return gulp.src([src_assets+'/icons/*.svg'])
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(rename(function (path) {
            path.basename = path.basename.slice(4);
            console.log('path.basename : ',path.basename);
        }))
        .pipe(iconfontCss({
            fontName:   fontName,
            cssClass:   cssClass,
            path:       src_assets+'/scss/templates/_icons.scss',
            targetPath: '../../scss/_icons.scss',
            fontPath:   '../fonts/iconfont/'
        }))
        .pipe(iconfont({
            fontName:   fontName,
            formats:    ['svg','ttf','eot','woff','woff2']
        }))
        .pipe(gulp.dest(src_assets+'/fonts/iconfont/'))
        .pipe(gulp.dest(dist_assets+'/fonts/iconfont/'));
});

// ************************************************
// TEMPLATES **************************************
// ************************************************
gulp.task('views', function() {
    return gulp.src(src_pages+'/templates/*.pug')
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }}))
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest('dist/pages'))
        .pipe(browserSync.reload({stream:true}));
});

// ************************************************
// COMPILATEURS DE CSS ****************************
// ************************************************
gulp.task('sass', function() {
    gulp.src([
            src_assets+'/scss/**/*.scss',
            src_vendor+'/bootstrap-sass/assets/stylesheets/*.scss'
        ])
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }}))
        .pipe(sass())
        .pipe(autoprefixer(autoprefixer_options))
        .pipe(gulp.dest(dist_assets+'/css/'))
        .pipe(rename({suffix: '.min'}))
        //.pipe(minifycss())
        .pipe(cleanCSS({compatibility: 'ie11'}))
        .pipe(gulp.dest(dist_assets+'/css/'))
        .pipe(browserSync.reload({stream:true}));
});

// ************************************************
// JAVASCRIPTS ************************************
// ************************************************
gulp.task('js', function() {
    return browserify({
        entries: src_assets+'/js/main.js',
        debug: true
        })
        .transform('babelify', {
            presets: ['es2015']
        })
        .bundle()
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(gulp.dest(dist_assets+'/js/'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(dist_assets+'/js/'))

    console.info("****** Tâche \"JAVASCRIPTS\" terminé ******");
});
// ************************************************




// ************************************************
// TASKS LAUNCHERS ********************************
// ************************************************

gulp.task('serve', ['browser-sync','sass','images','sprites-scss','fonts','iconfont', 'js', 'views'], function() {
    gulp.watch(src_assets+"/scss/**/*.scss", ['sass']);
    gulp.watch(src_pages+"/**/*.pug", ['views']);
    //gulp.watch(src_assets+"/js/**/*.js", ['js']);
    gulp.watch(src_assets+"/js/**/*.js", ['js']).on('change', browserSync.reload);
    gulp.watch(src_assets+"/icons/*.+(eot|svg|ttf|woff|woff2)", ['iconfont']);
    gulp.watch("*.html", ['bs-reload']);
    console.info("\n ******************************************\n","****** Tâche \"gulp serve\" terminée ******\n","******************************************\n");
});
