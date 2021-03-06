var gulp = require('gulp'),
    os = require('os'),
    fs = require('fs-extra'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace'),
    unzip = require('gulp-unzip'),
    remoteSrc = require('gulp-remote-src');

var pkg = require('./package.json');

function removeResource() {
    var files = [
        './mobile_android_lib/src/main/res/raw',
        './mobile_android_sample/app/src/main/assets/maps',
        './mobile_android_sample/app/src/main/assets/tiles',
        './mobile_android_sample_kotlin/app/src/main/assets/maps',
        './mobile_android_sample_kotlin/app/src/main/assets/tiles'
    ];
    for (var i=0; i<files.length; i++) {
        var file = files[i];
        try {
            fs.removeSync(file);
        } catch (e) {
        }
    }
}

function copyResource() {
    ['dist', 'parts', 'mobile.html'].forEach(function(res1) {
        ['core', 'mobile_gw'].forEach(function(mod) {
            var check = 'node_modules/@maplat/' + mod + '/' + res1;
            if (!fs.existsSync(check)) return;
            if (fs.statSync(check).isDirectory()) {
                fs.readdirSync(check).forEach(function(res) {
                    fs.copySync(check + '/' + res, './mobile_android_lib/src/main/res/raw/' + calcCopyTo(res1 + '/' + res));
                });
            } else {
                fs.copySync(check, './mobile_android_lib/src/main/res/raw/' + calcCopyTo(res1));
            }
        });
    });
}

function calcCopyTo(copy) {
    return copy.replace(/[\/\.\-]/g, '_').toLowerCase();
}

function copyAssets() {
    remoteSrc(['assets.zip'], {
        base: 'http://code4history.github.io/MaplatMobileGw/'
    }).pipe(unzip())
        .pipe(gulp.dest('./mobile_android_sample/app/src/main'))
        .pipe(gulp.dest('./mobile_android_sample_kotlin/app/src/main'));
}

gulp.task('init', function() {
    removeResource();
    copyResource();
    copyAssets();
    return new Promise(function(resolve, reject) {
        gulp.src(['./mobile_android_lib/build.gradle'])
            .pipe(concat('build.gradle'))
            .pipe(replace(/def VERSION_NAME = ".+"/g, 'def VERSION_NAME = "' + pkg.version + '"'))
            .on('error', reject)
            .pipe(gulp.dest('./mobile_android_lib/'))
            .on('end', resolve);
    });
});





