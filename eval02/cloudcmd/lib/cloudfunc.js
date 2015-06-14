var Util;

(function(scope, Util) {
    'use strict';
    
    var check, rendy;
    
    if (typeof module === 'object' && module.exports) {
        check           = require('checkup');
        rendy           = require('rendy');
        
        module.exports  = new CloudFuncProto(Util);
    } else {
        check           = Util.check;
        rendy           = Util.render;
        scope.CloudFunc = new CloudFuncProto(Util);
    }
    
    function CloudFuncProto() {
        var CloudFunc               = this,
            Entity                  = new entityProto(),
            FS;
        
        /* КОНСТАНТЫ (общие для клиента и сервера)*/
        
        /* название программы */
        this.NAME                   = 'Cloud Commander';
        
        /* если в ссылке будет эта строка - в браузере js отключен */
        this.FS    =   FS           = '/fs';
        
        this.apiURL                 = '/api/v1';
        /* id панелей с файлами */
        this.PANEL_LEFT             = 'js-left';
        this.PANEL_RIGHT            = 'js-right';
        this.CHANNEL_CONSOLE        = 'console-data';
        this.CHANNEL_TERMINAL       = 'terminal-data';
        this.CHANNEL_TERMINAL_RESIZE= 'terminal-resize';
        this.MAX_FILE_SIZE          = 500 * 1024;
        
        this.Entity                 = Entity;
        
        function entityProto() {
            var Entities = {
                '&nbsp;': ' ',
                '&lt;'  : '<',
                '&gt;'   : '>'
            };
            
            this.encode = function(str) {
                Object.keys(Entities).forEach(function(code) {
                    var char    = Entities[code],
                        reg     = RegExp(char, 'g');
                    
                    str = str.replace(reg, code);
                });
                
                return str;
            };
            
            this.decode = function(str) {
                Object.keys(Entities).forEach(function(code) {
                    var char    = Entities[code],
                        reg     = RegExp(code, 'g');
                    
                    str = str.replace(reg, char);
                });
                
                return str;
            };
        }
        
        this.formatMsg              = function(msg, name, status) {
            if (!status)
                status = 'ok';
            
            if (name)
                name = '("' + name + '")';
            else
                name = '';
            
            
            msg = msg + ': ' + status + name;
            
            return msg;
        };
        /**
         * Функция убирает последний слеш,
         * если он - последний символ строки
         */
        this.rmLastSlash            = function(path) {
            var length, lastSlash, isEqual;
            
            check(arguments, ['path'])
                .type('path', path, 'string');
            
            length      = path.length - 1;
            lastSlash   = path.lastIndexOf('/');
            isEqual     = lastSlash === length;
            
            if (length && isEqual)
                path = path.substr(path, length);
            
            return path;
        };
        
        /** Функция возвращает заголовок веб страницы
         * @pPath
         */
        this.getTitle               = function(pPath) {
            if (!CloudFunc.Path)
                CloudFunc.Path = '/';
                
            return  CloudFunc.NAME + ' - ' + (pPath || CloudFunc.Path);
                
        };
        
        /** Функция получает адреса каждого каталога в пути
         * возвращаеться массив каталогов
         * @param url -  адрес каталога
         */
        function getPathLink(url, template) {
            var namesRaw, names, length,
                pathHTML    = '',
                path        = '/';
            
            check(arguments, ['url', 'template']);
            
            namesRaw    = url.split('/')
                             .slice(1, -1),
            
            names       = [].concat('/', namesRaw),
            
            length      = names.length - 1;
            
            names.forEach(function(name, index) {
                var slash       = '',
                    isLast      = index === length;
                
                if (index)
                    path        += name + '/';
                
                if (index && isLast) {
                    pathHTML    += name + '/';
                } else {
                    if (index)
                        slash = '/';
                    
                    pathHTML    += rendy(template, {
                        path: path,
                        name: name,
                        slash: slash
                    });
                }
            });
            
            return pathHTML;
        }
        
        /**
         * Функция строит таблицу файлв из JSON-информации о файлах
         * @param params - информация о файлах 
         *
         */
        this.buildFromJSON          = function(params) {
            var file, i, n, type, attribute, size, owner, mode,
                dotDot, link, dataName,
                linkResult,
                template        = params.template,
                templateFile    = template.file,
                templateLink    = template.link,
                json            = params.data,
                files           = json.files,
                path            = json.path,
                
                /* 
                 * Строим путь каталога в котором мы находимся
                 * со всеми подкаталогами
                 */
                htmlPath        = getPathLink(path, template.pathLink),
                
                /* Убираем последний слэш
                 * с пути для кнопки обновить страницу
                 * если он есть
                 */
                refreshPath    = CloudFunc.rmLastSlash(path),
                
                fileTable       = rendy(template.path, {
                    link        : FS + refreshPath,
                    fullPath    : path,
                    path        : htmlPath
                }),
                
                header         = rendy(templateFile, {
                    tag         : 'div',
                    attribute   : '',
                    className   : 'fm-header',
                    type        : '',
                    name        : 'name',
                    size        : 'size',
                    owner       : 'owner',
                    mode        : 'mode'
                });
            
            fileTable          += header;
            
            /* сохраняем путь */
            CloudFunc.Path      = path;
            
            fileTable           += '<ul data-name="js-files" class="files">';
            /* Если мы не в корне */
            if (path !== '/') {
                /* убираем последний слеш и каталог в котором мы сейчас находимся*/
                dotDot          = path.substr(path, path.lastIndexOf('/'));
                dotDot          = dotDot.substr(dotDot, dotDot.lastIndexOf('/'));
                /* Если предыдущий каталог корневой */
                if (dotDot === '')
                    dotDot = '/';
                
                link            = FS + dotDot;
                
                linkResult      = rendy(template.link, {
                    link        : link,
                    title       : '..',
                    name        : '..'
                });
                
                dataName        = 'data-name="js-file-.." ',
                attribute       = 'draggable="true" ' + dataName,
                /* Сохраняем путь к каталогу верхнего уровня*/
                fileTable += rendy(template.file, {
                    tag         : 'li',
                    attribute   : attribute,
                    className   : '',
                    type        : 'directory',
                    name        : linkResult,
                    size        : '&lt;dir&gt;',
                    owner       : '.',
                    mode        : '--- --- ---'
                });
            }
            
            n = files.length;
            for (i = 0; i < n; i++) {
                file            = files[i];
                link            = FS + path + file.name;
                
                if (file.size === 'dir') {
                    type        = 'directory';
                    attribute   = '';
                    size        = '&lt;dir&gt;';
                } else {
                    type        = 'text-file';
                    attribute   = 'target="_blank" ';
                    size        = file.size;
                }
                
                owner   = file.owner || 'root';
                mode    = file.mode;
                
                linkResult  = rendy(templateLink, {
                    link        : link,
                    title       : file.name,
                    name        : Entity.encode(file.name),
                    attribute   : attribute
                });
                
                dataName        = 'data-name="js-file-' + file.name + '" ';
                attribute       = 'draggable="true" ' + dataName;
                
                fileTable += rendy(templateFile, {
                    tag         : 'li',
                    attribute   : attribute,
                    className   : '',
                    /* Если папка - выводим пиктограмму папки   *
                     * В противоположном случае - файла         */
                    type        : type,
                    name        : linkResult,
                    size        : size,
                    owner       : owner,
                    mode        : mode
                });
            }
            
            fileTable          += '</ul>';
            
            return fileTable;
        };
     }
})(this, Util);
