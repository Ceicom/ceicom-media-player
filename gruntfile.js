module.exports = function (grunt) {

    //dependencies
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    const gruntSettings = {

        /* COMPILADOR LESS */
        less: {
            lessfiles: {
                files: {
                    "build/cmp.css": "less/main.less"
                },
                ieCompat: false
            }
        },

        /* POST CSS AUTO-PREFIXER CSS */
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({
                        remove: false,
                        grid: true,
                        browsers: [
                            'last 4 Chrome versions',
                            'last 4 Firefox versions',
                            'last 4 Edge versions',
                            'last 4 iOS versions',
                            'last 4 Opera versions',
                            'last 4 Safari versions',
                            'last 4 OperaMobile versions',
                            'last 4 OperaMini versions',
                            'last 4 ChromeAndroid versions',
                            'last 4 FirefoxAndroid versions',
                            'last 4 ExplorerMobile versions'
                        ]
                    })
                ]
            },
            lessfiles: {
                src: 'build/cmp.css'
            }
        },

        /* CSSMIN MINIFICA, COMBINA CSS */
        cssmin: {
            options: {
                report: 'gzip'
            },
            lessfiles: {
                files: {
                    'build/cmp.min.css': ['build/cmp.css']
                }
            }
        },

        /* COPY, COPIA ICONES */
        copy: {
            copyvendor: {
                files: [{
                    expand: true,
                    cwd: 'icons',
                    src: ['**/*.svg'],
                    dest: 'build/icons/'
                }]
            }
        },

        /* BABEL */
        babel: {
            options: {
                presets: ['@babel/preset-env']
            },
            dist: {
                files: { 'build/cmp.js': 'js/script.js' }
            }
        },

        /* UGLIFY MINIFICA */
        uglify: {
            options: {
                compress: {
                    drop_debugger: false
                }
            },
            jsfiles: {
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: ['cmp.js'],
                    dest: 'build',
                    ext: '.min.js',
                    extDot: 'last'
                }]
            }
        },

        /* WATCH, VERIFICA ALTERAÇÕES NOS ARQUIVOS */
        watch: {
            options: {
                spawn: false,
                interrupt: true
            },
            lessfiles: {
                files: ['less/main.less'],
                tasks: ['less:lessfiles', 'postcss:lessfiles', 'cssmin:lessfiles']
            },
            jsfiles: {
                files: ['js/script.js'],
                tasks: ['babel', 'uglify:jsfiles']
            },
            gruntfile: {
                files: ['gruntfile.js']
            }
        }
    };

    grunt.initConfig(gruntSettings);

    /* TAREFA PADRÃO */
    grunt.registerTask('default', ['watch']);

    /* TAREFA GERA TUDO */
    grunt.registerTask('init', ['less', 'postcss', 'copy', 'cssmin', 'babel', 'uglify']);
};
