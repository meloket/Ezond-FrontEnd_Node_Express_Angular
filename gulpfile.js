var gulp = require('gulp'),
    concat = require('gulp-concat');

var fs = require('fs');

var foreach = require('gulp-each');


gulp.task('bundle3', function() {
 return gulp.src(['public/app/**/*.html'])
                .pipe(foreach(function(content, file, callback) {
                    var fila = ''
                    file.path = file.path.split('\\').join('/')
                    if (file.path.indexOf('pages') != -1){
                        fila = '/app/pages/' + file.path.substr(file.path.indexOf('app/pages/') + 'app/pages/'.length)
                    }
                    else{
                        fila = '/app/modules' + file.path.substr(file.path.indexOf('app/modules')  + 'app/modules/'.length)
                    }
                    var newContent = '<script type="text/ng-template" id="' + fila  + '">' + content + "</script>";
                    callback(null, newContent)
                }))
                .pipe(concat('hi.html'))
                .pipe(gulp.dest('public/build'))
});


gulp.task('bundle2', function() {
    var srcpaths = []

    let data = fs.readFileSync('./views/dashboard_index/head_tags.html', 'utf8');
    let exp = /href=\"css([^"]*)\"/g
    data.match(exp).forEach(function (value) {
        srcpaths.push('public/'+value.substr(6,value.length-7))
    })

    return gulp.src(
         srcpaths 
    ).pipe(concat('nice.css')).pipe(gulp.dest('public/build'))
});


gulp.task('compile', ['bundle', 'bundle3'], function () {
    return gulp.src('views/dashboard_index/index.html').pipe(foreach(function (content, file, callback) {
        var newContent = content
        newContent = newContent.replace('footer_scripts.html', 'footer_scripts2.html')
        newContent = newContent.replace('<!-- hihtml -->', '<% include ../../public/build/hi.html %>')

        callback(null, newContent)
    })).pipe(concat('index.html')).pipe(gulp.dest('views/dashboard_index'))
})

gulp.task('clear', function() {
    return gulp.src('views/dashboard_index/index.html').pipe(foreach(function (content, file, callback) {
        var newContent = content.replace('head_tags2.html', 'head_tags.html')
        // var newContent = content
        newContent = newContent.replace('footer_scripts2.html', 'footer_scripts.html')
        newContent = newContent.replace('<% include ../../public/build/hi.html %>', '<!-- hihtml -->')

        callback(null, newContent)
    })).
    pipe(concat('index.html')).pipe(gulp.dest('views/dashboard_index'))
})

gulp.task('bundle', function() {

    var srcpaths = []

    let data = fs.readFileSync('./views/dashboard_index/footer_scripts.html', 'utf8');
    let exp = /src=\"([^"]*)\"/g
    data = data.split('<!-- UNUSED -->')[0]
    console.log(data)
    data.match(exp).forEach(function (value) {
        srcpaths.push('public/'+value.substr(5,value.length-6))
    })


    return gulp.src(
         srcpaths 
    ).pipe(concat('appe.js')).pipe(gulp.dest('public/build'))
});

gulp.task('default', function() {
    return
})