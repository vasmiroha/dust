var gulp    = require('gulp'),
    connect = require('gulp-connect');

gulp.task('watch', function(){
    gulp.src('public/**/*.*')
        .pipe(connect.reload())
});



gulp.task('connect', function () {
    connect.server({
        root: '',
        port: 8000,
        livereload: true
    });
});

gulp.task('all', function () {
    gulp.watch(['public/**/*.*'], ['watch']);
});

gulp.task('default',['connect', 'all']);