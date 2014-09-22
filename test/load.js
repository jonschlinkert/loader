/*!
 * load-templates <https://github.com/jonschlinkert/load-templates>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var fs = require('fs');
var chalk = require('chalk');
var path = require('path');
var assert = require('assert');
var should = require('should');
var loader = require('..');


describe(chalk.magenta('[ string | object ]') + ' pattern:', function () {
  describe(chalk.bold('valid filepath:'), function () {
    it('should detect when the string is a filepath:', function () {
      var files = loader.normalize('test/fixtures/one/a.md');
      files['test/fixtures/one/a.md'].should.have.property('path', 'test/fixtures/one/a.md');
    });

    it('should read the file and return an object:', function () {
      var files = loader.normalize('test/fixtures/a.md');
      files['test/fixtures/a.md'].should.be.an.object;
    });

    it('should extend the object with `content` from the file:', function () {
      var files = loader.normalize('test/fixtures/one/a.md');
      files['test/fixtures/one/a.md'].should.have.property('content', 'This is {{title}}');
    });

    it('should extend the object with the `path` for the file:', function () {
      var files = loader.normalize('test/fixtures/a.md');
      files['test/fixtures/a.md'].should.have.property('path', 'test/fixtures/a.md');
    });

    it('should extend the object with `content`:', function () {
      var files = loader.normalize('test/fixtures/a.md');
      files['test/fixtures/a.md'].should.have.property('content', 'This is fixture a.md');
    });

    it('should extend the object with `locals`:', function () {
      var files = loader.normalize('test/fixtures/a.md', {a: 'b'});
      files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
    });

    it('should extend the object with `options`:', function () {
      var files = loader.normalize('test/fixtures/a.md', {a: 'b'}, {something: true});
      files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
      files['test/fixtures/a.md'].should.have.property('options', {something: true});
    });

    it('should parse front matter:', function () {
      var files = loader.normalize('test/fixtures/a.md');
      files['test/fixtures/a.md'].should.have.property('data', { title: 'AAA' });
    });

    it('should create `orig` from parsed file string:', function () {
      var files = loader.normalize('test/fixtures/a.md');
      files['test/fixtures/a.md'].should.have.property('orig', '---\ntitle: AAA\n---\nThis is fixture a.md');
    });

    it('should keep `locals` and `data` from front matter separate:', function () {
      var files = loader.normalize('test/fixtures/a.md', {a: 'b'});
      files['test/fixtures/a.md'].should.have.property('locals', { a: 'b' });
      files['test/fixtures/a.md'].should.have.property('data', { title: 'AAA' });
      files['test/fixtures/a.md'].should.have.property('orig', '---\ntitle: AAA\n---\nThis is fixture a.md');
    });

    it('should get locals from the second argument:', function () {
      var files = loader.normalize('test/fixtures/one/a.md', {name: 'Brian Woodward'});
      files['test/fixtures/one/a.md'].should.have.property('locals', {name: 'Brian Woodward'});
    });
  });

  describe(chalk.bold('valid glob pattern:'), function () {
    it('should expand glob patterns:', function () {
      var files = loader.normalize('test/fixtures/*.txt');
      files.should.be.an.object;
      files['test/fixtures/a.txt'].should.exist;
    });

    it('should read files and return an object for each:', function () {
      var files = loader.normalize('test/fixtures/*.txt');
      files.should.be.an.object;
      files['test/fixtures/a.txt'].should.exist;
      files['test/fixtures/b.txt'].should.exist;
      files['test/fixtures/c.txt'].should.exist;
    });

    it('should extend the objects with locals:', function () {
      var files = loader.normalize('test/fixtures/*.txt', {name: 'Brian Woodward'});
      files['test/fixtures/a.txt'].should.have.property('locals', {name: 'Brian Woodward'});
      files['test/fixtures/b.txt'].should.have.property('locals', {name: 'Brian Woodward'});
      files['test/fixtures/c.txt'].should.have.property('locals', {name: 'Brian Woodward'});
    });

    it('should extend the objects with a `path` property.', function () {
      var files = loader.normalize('test/fixtures/*.txt');
      files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
      files['test/fixtures/b.txt'].should.have.property('path', 'test/fixtures/b.txt');
      files['test/fixtures/c.txt'].should.have.property('path', 'test/fixtures/c.txt');
    });

    it('should extend the objects with `content` from the file:', function () {
      var files = loader.normalize('test/fixtures/*.txt');
      files['test/fixtures/a.txt'].should.have.property('content', 'This is from a.txt.');
      files['test/fixtures/b.txt'].should.have.property('content', 'This is from b.txt.');
      files['test/fixtures/c.txt'].should.have.property('content', 'This is from c.txt.');
    });

    it('should extend the objects with `options`:', function () {
      var files = loader.normalize('test/fixtures/*.txt', {a: 'b'}, {c: true});
      files['test/fixtures/a.txt'].should.have.property('options', {c: true});
      files['test/fixtures/b.txt'].should.have.property('options', {c: true});
      files['test/fixtures/c.txt'].should.have.property('options', {c: true});
    });

    it('should detect options passed on the locals object:', function () {
      var files = loader.normalize('test/fixtures/*.txt', {a: 'b', options: {b: 'b'}}, {c: true});
      files['test/fixtures/a.txt'].should.have.property('options', {b: 'b', c: true});
      files['test/fixtures/b.txt'].should.have.property('options', {b: 'b', c: true});
      files['test/fixtures/c.txt'].should.have.property('options', {b: 'b', c: true});

      // ensure that locals is correct
      files['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
      files['test/fixtures/b.txt'].should.have.property('locals', {a: 'b'});
      files['test/fixtures/c.txt'].should.have.property('locals', {a: 'b'});
    });

    it('should parse front matter:', function () {
      var files = loader.normalize('test/fixtures/*.txt');
      files['test/fixtures/a.txt'].should.have.property('data', { title: 'AAA' });
      files['test/fixtures/b.txt'].should.have.property('data', { title: 'BBB' });
      files['test/fixtures/c.txt'].should.have.property('data', { title: 'CCC' });
    });

    it('should create `orig` from parsed file string:', function () {
      var files = loader.normalize('test/fixtures/*.txt');
      files['test/fixtures/a.txt'].should.have.property('orig', '---\ntitle: AAA\n---\nThis is from a.txt.');
      files['test/fixtures/b.txt'].should.have.property('orig', '---\ntitle: BBB\n---\nThis is from b.txt.');
      files['test/fixtures/c.txt'].should.have.property('orig', '---\ntitle: CCC\n---\nThis is from c.txt.');
    });

    it('should keep `locals` and `data` from front matter separate:', function () {
      var files = loader.normalize('test/fixtures/*.txt', {a: 'b'});
      files['test/fixtures/a.txt'].should.have.property('locals', { a: 'b' });
      files['test/fixtures/a.txt'].should.have.property('data', { title: 'AAA' });
    });

    it('should NOT ATTEMPT to resolve glob patterns when second value is a string:', function () {
      var files = loader.normalize('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
      files['test/fixtures/*.md'].should.have.property('path', 'test/fixtures/*.md');
      files['test/fixtures/*.md'].should.have.property('content', 'flflflfl');
    });
  });

  describe(chalk.bold('non-filepath, non-glob pattern:'), function () {
    it('should move arbitrary props on the second arg to `locals`:', function () {
      var files = loader.normalize('a', {content: 'this is content', layout: 'b'});
      files['a'].should.have.property('locals', {layout: 'b'});
    });
    it('should move arbitrary props on the third arg to `options`:', function () {
      var files = loader.normalize('test/fixtures/*.md', {a: 'b'}, {engine: 'hbs'});
      files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
      files['test/fixtures/a.md'].should.have.property('options', {engine: 'hbs'});
    });

    it('should load individual templates:', function () {
      var files = loader.normalize('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
      files['foo1.md'].should.have.property('content');
    });

    describe('when a `content` prop and actual content cannot be found:', function () {
      it('should not add a content property:', function () {
        var files = loader.normalize({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}});
        files['bar1.md'].should.not.have.property('content');
      });

      it('should add other prorties found on the object:', function () {
        var files = loader.normalize({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true});
        files['baz.md'].should.have.property('path');
      });
    });

    it.skip('should detect locals when passed as a second param', function () {
      var files = loader.normalize('whatever', {name: 'Brian Woodward'});
      files['whatever'].should.have.property('locals', {name: 'Brian Woodward'});
    });

    it.skip('should return `{content: null}` when content is not defined or detected.', function () {
      var files = loader.normalize('whatever', {name: 'Brian Woodward'});
      files['whatever'].should.have.property('content', null);
    });


    it('should load when content is a property on an object.', function () {
      var files = loader.normalize('a.md', {content: 'c'});
      files['a.md'].should.have.property('content', 'c');
    });

    it.skip('should load even if the key is an invalid filepath.', function () {
      var files = loader.normalize('a.md');
      files.should.have.property('__id__1');
    });

    it.skip('should load even if the key is an invalid filepath.', function () {
      var files = loader.normalize('a.md', 'b');
      files['a.md'].should.have.property('content', 'b');
    });

    it('should detect content passed as a second arg', function () {
      var files = loader.normalize('foo/bar/abc.md', 'This is content.');
      files['foo/bar/abc.md'].should.have.property('path');
      files['foo/bar/abc.md'].content.should.equal('This is content.');
    });

    it('should detect locals passed as a third arg', function () {
      var files = loader.normalize('foo/bar/abc.md', 'This is content.', { a: 'b' });
      files['foo/bar/abc.md'].should.have.property('locals', { a: 'b' });
    });

    it('should detect options passed as a fourth arg', function () {
      var files = loader.normalize('foo/bar/abc.md', 'This is content.', { a: 'b' }, { c: 'd' });
      files['foo/bar/abc.md'].should.have.property('locals', { a: 'b' }, { c: 'd' });
    });

    describe('when the second arg is an object:', function () {
      it('should use the first arg as the key.', function () {
        var files = loader.normalize('a', {content: 'A above\n{{body}}\nA below', layout: 'b'});
        files['a'].should.have.property('content', 'A above\n{{body}}\nA below');
        files['a'].should.have.property('locals', {layout: 'b'});
      });
    });
  });
});


describe(chalk.magenta('[ string | string ]') + ' pattern:', function () {
  it('should assume the second arg is `content`.', function () {
    var files = loader.normalize('abc.md', 'This is content.');
    files['abc.md'].should.have.property('content', 'This is content.');
  });

  it('should assume the first arg is the template key.', function () {
    var files = loader.normalize('abc.md', 'This is content.');
    files['abc.md'].should.have.property('path', 'abc.md');
  });

  it('should assume the key is not a file path.', function () {
    var files = loader.normalize('abc.md', 'This is content.');
    files['abc.md'].should.have.property('path', 'abc.md');
  });

  it('should extend the object with `locals`', function () {
    var files = loader.normalize('abc.md', 'This is content.', {a: 'b'}, {locals: {c: 'd'}});
    files['abc.md'].should.have.property('locals', {a: 'b'});
  });

  it('should extend the object with `options`', function () {
    var files = loader.normalize('abc.md', 'This is content.', {a: 'b'}, {c: 'd'});
    files['abc.md'].should.have.property('locals', {a: 'b'});
    files['abc.md'].should.have.property('options', {c: 'd'});
  });
});



describe(chalk.magenta('[ object ]') + ' pattern:', function () {
  describe('when templates are formatted as objects', function () {
    it('should load multiple templates from objects:', function () {
      var files = loader.normalize({a: {layout: 'b', content: 'A above\n{{body}}\nA below' }});
      files.should.have.property('a');
      files.a.locals.should.have.property('layout');
    });
    it('should load multiple templates from objects:', function () {
      var files = loader.normalize({b: {layout: 'c', content: 'B above\n{{body}}\nB below' }});
      files.should.have.property('b');
      files.b.locals.should.have.property('layout');
    });
    it('should load multiple templates from objects:', function () {
      var files = loader.normalize({c: {layout: 'd', content: 'C above\n{{body}}\nC below' }});
      files.should.have.property('c');
      files.c.locals.should.have.property('layout');
    });
  });

  it('should load loader from an object', function () {
    var files = loader.normalize({'foo/bar.md': {content: 'this is content.'}});
    files['foo/bar.md'].should.have.property('path', 'foo/bar.md');
    files['foo/bar.md'].should.not.have.property('locals');
    files['foo/bar.md'].should.have.property('content', 'this is content.');
  });

  it('should normalize locals passed as a second param', function () {
    var files = loader.normalize({'foo/bar.md': {content: 'this is content.'}}, {foo: 'bar'});

    files['foo/bar.md'].should.have.property('path', 'foo/bar.md');
    files['foo/bar.md'].should.have.property('locals', {foo: 'bar'});
    files['foo/bar.md'].locals.should.eql({foo: 'bar'});
  });

  it('should use the key as the `path`:', function () {
    var files = loader.normalize({a: {content: 'A above\n{{body}}\nA below' , layout: 'b'}});

    files['a'].should.have.property('path', 'a');
    files['a'].should.have.property('locals');
    files['a'].locals.should.have.property('layout', 'b');
  });
});


describe(chalk.magenta('[ array ]') + ' pattern:', function () {
  describe(chalk.bold('valid glob pattern:'), function () {
    it('should expand an array of glob patterns:', function () {
      var files = loader.normalize(['test/fixtures/*.txt']);
      files.should.be.an.object;
      files['test/fixtures/a.txt'].should.exist;
    });

    it('should read files and return an object for each:', function () {
      var files = loader.normalize(['test/fixtures/*.txt']);
      files.should.be.an.object;
      files['test/fixtures/a.txt'].should.exist;
      files['test/fixtures/b.txt'].should.exist;
      files['test/fixtures/c.txt'].should.exist;
    });

    it('should create a `path` property from each filepath.', function () {
      var files = loader.normalize(['test/fixtures/*.txt']);
      files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
      files['test/fixtures/b.txt'].should.have.property('path', 'test/fixtures/b.txt');
      files['test/fixtures/c.txt'].should.have.property('path', 'test/fixtures/c.txt');
    });

    it('should extend the objects with locals:', function () {
      var files = loader.normalize(['test/fixtures/*.txt'], {name: 'Brian Woodward'});
      files['test/fixtures/a.txt'].should.have.property('locals', {name: 'Brian Woodward'});
      files['test/fixtures/b.txt'].should.have.property('locals', {name: 'Brian Woodward'});
      files['test/fixtures/c.txt'].should.have.property('locals', {name: 'Brian Woodward'});
    });

    it('should extend the objects with locals and options:', function () {
      var files = loader.normalize(['test/fixtures/*.md', 'test/fixtures/*.txt'], {a: 'b'}, {
        engine: 'hbs'
      });

      files['test/fixtures/a.md'].should.have.property('locals', {a: 'b'});
      files['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
      files['test/fixtures/a.md'].should.have.property('options', {engine: 'hbs'});
      files['test/fixtures/a.txt'].should.have.property('options', {engine: 'hbs'});
    });

    it('should extend the objects with a `path` property.', function () {
      var files = loader.normalize(['test/fixtures/*.txt']);
      files['test/fixtures/a.txt'].should.have.property('path', 'test/fixtures/a.txt');
      files['test/fixtures/b.txt'].should.have.property('path', 'test/fixtures/b.txt');
      files['test/fixtures/c.txt'].should.have.property('path', 'test/fixtures/c.txt');
    });

    it('should extend the objects with `content` from the file:', function () {
      var files = loader.normalize(['test/fixtures/*.txt']);
      files['test/fixtures/a.txt'].should.have.property('content', 'This is from a.txt.');
      files['test/fixtures/b.txt'].should.have.property('content', 'This is from b.txt.');
      files['test/fixtures/c.txt'].should.have.property('content', 'This is from c.txt.');
    });

    it('should extend the objects with `options`:', function () {
      var files = loader.normalize(['test/fixtures/*.txt'], {a: 'b'}, {c: true});
      files['test/fixtures/a.txt'].should.have.property('options', {c: true});
      files['test/fixtures/b.txt'].should.have.property('options', {c: true});
      files['test/fixtures/c.txt'].should.have.property('options', {c: true});
    });

    it('should detect options passed on the locals object:', function () {
      var files = loader.normalize(['test/fixtures/*.txt'], {a: 'b', options: {b: 'b'}}, {c: true});
      files['test/fixtures/a.txt'].should.have.property('options', {b: 'b', c: true});
      files['test/fixtures/b.txt'].should.have.property('options', {b: 'b', c: true});
      files['test/fixtures/c.txt'].should.have.property('options', {b: 'b', c: true});

      // ensure that locals is correct
      files['test/fixtures/a.txt'].should.have.property('locals', {a: 'b'});
      files['test/fixtures/b.txt'].should.have.property('locals', {a: 'b'});
      files['test/fixtures/c.txt'].should.have.property('locals', {a: 'b'});
    });

    it('should parse front matter:', function () {
      var files = loader.normalize(['test/fixtures/*.txt']);
      files['test/fixtures/a.txt'].should.have.property('data', { title: 'AAA' });
      files['test/fixtures/b.txt'].should.have.property('data', { title: 'BBB' });
      files['test/fixtures/c.txt'].should.have.property('data', { title: 'CCC' });
    });

    it('should create `orig` from parsed file string:', function () {
      var files = loader.normalize(['test/fixtures/*.txt']);
      files['test/fixtures/a.txt'].should.have.property('orig', '---\ntitle: AAA\n---\nThis is from a.txt.');
      files['test/fixtures/b.txt'].should.have.property('orig', '---\ntitle: BBB\n---\nThis is from b.txt.');
      files['test/fixtures/c.txt'].should.have.property('orig', '---\ntitle: CCC\n---\nThis is from c.txt.');
    });

    it('should keep `locals` and `data` from front matter separate:', function () {
      var files = loader.normalize(['test/fixtures/*.txt'], {a: 'b'});
      files['test/fixtures/a.txt'].should.have.property('locals', { a: 'b' });
      files['test/fixtures/a.txt'].should.have.property('data', { title: 'AAA' });
    });
  });
});



describe('normalize templates', function () {
  describe('path and content properties', function () {
    var expected = { 'a/b/c.md': { path: 'a/b/c.md', content: 'this is content.'}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize({path: 'a/b/c.md', content: 'this is content.'});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.normalize({ 'a/b/c.md': { content: 'this is content.'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize('a/b/c.md', {content: 'this is content.'});
      files.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var files = loader.normalize('a/b/c.md', 'this is content.');
        files.should.eql(expected);
      });
    });
  });


  describe('multiple templates:', function () {
    describe('objects:', function () {
      it('should use `path` and/or `content` properties as indicators:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.'},
          'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.'},
          'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.'}
        };

        var files = loader.normalize({
          'a/b/a.md': {content: 'this is content.'},
          'a/b/b.md': {content: 'this is content.'},
          'a/b/c.md': {content: 'this is content.'}
        });

        files.should.eql(expected);
      });

      it('should normalize locals:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.', locals: {a: {b: 'c'}}},
          'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.'}
        };

        var files = loader.normalize({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {content: 'this is content.'}
        });
        files.should.eql(expected);
      });

      it('should normalize "method" locals:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.', locals: {a: {b: 'c'}, foo: 'bar'}},
          'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.', locals: {a: {c: 'd'}, foo: 'bar'}},
          'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.', locals: {foo: 'bar'}}
        };

        var files = loader.normalize({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}}},
          'a/b/c.md': {content: 'this is content.'}
        }, {foo: 'bar'});

        files.should.eql(expected);
      });

      it('should normalize "method" locals:', function () {
        var expected = {
          'a/b/a.md': {path: 'a/b/a.md', content: 'this is content.', locals: {a: {b: 'c'}, bar: 'bar'}},
          'a/b/b.md': {path: 'a/b/b.md', content: 'this is content.', locals: {a: {c: 'd'}, bar: 'bar'}},
          'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.', locals: {bar: 'baz'}}
        };

        var files = loader.normalize({
          'a/b/a.md': {content: 'this is content.', a: {b: 'c'}, bar: 'bar'},
          'a/b/b.md': {content: 'this is content.', locals: {a: {c: 'd'}, bar: 'bar'}},
          'a/b/c.md': {content: 'this is content.'}
        }, {bar: 'baz'});

        files.should.eql(expected);
      });
    });
  });


  describe('locals', function () {
    var expected = { 'a/b/c.md': { path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize({path: 'a/b/c.md', content: 'this is content.', a: 'b'});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.normalize({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.normalize({ 'a/b/c.md': { content: 'this is content.', a: 'b'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize('a/b/c.md', {content: 'this is content.', a: 'b'});
      files.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var files = loader.normalize('a/b/c.md', 'this is content.', {a: 'b'});
        files.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var files = loader.normalize('a/b/c.md', 'this is content.', {locals: {a: 'b'}});
        files.should.eql(expected);
      });
    });
  });

  describe('options', function () {
    var expected = { 'a/b/c.md': { path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}}};

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize({path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize({path: 'a/b/c.md', content: 'this is content.', a: 'b', options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.normalize({ 'a/b/c.md': { content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}}});
      files.should.eql(expected);
    });

    it('should use the key to fill in a missing `path` property', function () {
      var files = loader.normalize({ 'a/b/c.md': { content: 'this is content.', a: 'b', options: {y: 'z'}}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize('a/b/c.md', {content: 'this is content.', locals: {a: 'b'}, options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize('a/b/c.md', {content: 'this is content.', a: 'b'}, {y: 'z'});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize('a/b/c.md', {content: 'this is content.', a: 'b'}, {options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize('a/b/c.md', {content: 'this is content.', a: 'b'}, {options: {y: 'z'}});
      files.should.eql(expected);
    });

    it('should detect the key from an object with `path` and `content` properties', function () {
      var files = loader.normalize('a/b/c.md', {content: 'this is content.', a: 'b', options: {y: 'z'}});
      files.should.eql(expected);
    });

    describe('when the first two args are strings:', function () {
      it('should create an object with `path` and `content` properties', function () {
        var files = loader.normalize('a/b/c.md', 'this is content.', {a: 'b'}, {options: {y: 'z'}});
        files.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var files = loader.normalize('a/b/c.md', 'this is content.', {a: 'b', options: {y: 'z'}});
        files.should.eql(expected);
      });

      it('should create an object with `path` and `content` properties', function () {
        var files = loader.normalize('a/b/c.md', 'this is content.', {locals: {a: 'b'}, options: {y: 'z'}});
        files.should.eql(expected);
      });
    });
  });
});

describe('glob patterns', function () {
  describe('arrays', function () {
    var expected = {
      'test/fixtures/a.txt': {
        data: { title: 'AAA' },
        content: 'This is from a.txt.',
        orig: '---\ntitle: AAA\n---\nThis is from a.txt.',
        path: 'test/fixtures/a.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/b.txt': {
        data: { title: 'BBB' },
        content: 'This is from b.txt.',
        orig: '---\ntitle: BBB\n---\nThis is from b.txt.',
        path: 'test/fixtures/b.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/c.txt': {
        data: { title: 'CCC' },
        content: 'This is from c.txt.',
        orig: '---\ntitle: CCC\n---\nThis is from c.txt.',
        path: 'test/fixtures/c.txt',
        locals: {a: 'b'},
        options: {foo: true}
      }
    };

    it('should read a glob of files and return an object of templates.', function () {
      loader.normalize(['test/fixtures/*.txt'], {a: 'b'}, {foo: true}).should.eql(expected);
    });

    it('should read a glob of files and return an object of templates.', function () {
      loader.normalize(['test/fixtures/*.txt'], {a: 'b', options: {foo: true}}).should.eql(expected);
    });
  });

  describe('strings', function () {
    var expected = {
      'test/fixtures/a.txt': {
        data: { title: 'AAA' },
        content: 'This is from a.txt.',
        orig: '---\ntitle: AAA\n---\nThis is from a.txt.',
        path: 'test/fixtures/a.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/b.txt': {
        data: { title: 'BBB' },
        content: 'This is from b.txt.',
        orig: '---\ntitle: BBB\n---\nThis is from b.txt.',
        path: 'test/fixtures/b.txt',
        locals: {a: 'b'},
        options: {foo: true}
      },
     'test/fixtures/c.txt': {
        data: { title: 'CCC' },
        content: 'This is from c.txt.',
        orig: '---\ntitle: CCC\n---\nThis is from c.txt.',
        path: 'test/fixtures/c.txt',
        locals: {a: 'b'},
        options: {foo: true}
      }
    };

    it('should read a glob of files and return an object of templates.', function () {
      loader.normalize('test/fixtures/*.txt', {a: 'b'}, {foo: true}).should.eql(expected);
    });
  });
});

describe('random', function () {
  it('should normalize a template with a non-filepath key.', function () {
    var files = loader.normalize('foo', {content: 'this is content.'});
    files.should.eql({'foo': {path: 'foo', content: 'this is content.'}});
  });

  it('should normalize a template with a non-filepath key.', function () {
    var files = loader.normalize('foo', {content: 'this is content.', a: 'b'}, {fez: 'foo'});
    files.should.eql({'foo': {path: 'foo', content: 'this is content.', locals: {a: 'b'}, options: {fez: 'foo'}}});
  });

  it('should normalize a template with a non-filepath key.', function () {
    var files = loader.normalize({'foo': {content: 'this is content.', a: 'b'}}, {fez: 'foo'});
    files.should.eql({'foo': {path: 'foo', content: 'this is content.', locals: {a: 'b', fez: 'foo'}}});
  });

  it('random stuff', function () {
    var files = loader.normalize({path: 'a/b/c.md', content: 'this is content.', a: 'b', options: {y: 'z'}}, {c: 'd'}, {e: 'f'});
    files.should.eql({'a/b/c.md': {path: 'a/b/c.md', content: 'this is content.', locals: {a: 'b', c: 'd'}, options: {y: 'z', e: 'f'}}});
  });

  it('random stuff', function () {
    var files = loader.normalize({path: 'a/b/c.md', content: 'this is foo'}, {foo: 'bar'});
    files.should.eql({'a/b/c.md': {path: 'a/b/c.md', content: 'this is foo', locals: {foo: 'bar'}}});
  });

  it('random stuff', function () {
    var files = loader.normalize('a/b/c.md', {content: 'this is baz', a: 'b', options: {foo: 'bar'}}, {bar: 'baz'});
    files.should.eql({'a/b/c.md': {path: 'a/b/c.md', content: 'this is baz', locals: {a: 'b'}, options: {bar: 'baz', foo: 'bar'}}});
  });

  it('random stuff', function () {
    var files = loader.normalize('a/b/c.md', {content: 'this is baz', orig: 'this is baz', a: 'b', options: {foo: 'bar'}}, {bar: 'baz'});
    files.should.eql({'a/b/c.md': {path: 'a/b/c.md', content: 'this is baz', orig: 'this is baz', locals: {a: 'b'}, options: {bar: 'baz', foo: 'bar'}}});
  });

  it('multiple templates:', function () {
    var files = loader.normalize({
      'a/b/a.md': {content: 'this is content'},
      'a/b/b.md': {content: 'this is content'},
      'a/b/c.md': {content: 'this is content'}
    }, {a: 'b'}, {c: true});

    files['a/b/a.md'].should.have.property('path', 'a/b/a.md');
    files['a/b/b.md'].should.have.property('path', 'a/b/b.md');
    files['a/b/c.md'].should.have.property('path', 'a/b/c.md');

    files['a/b/a.md'].should.have.property('content', 'this is content');
    files['a/b/b.md'].should.have.property('content', 'this is content');
    files['a/b/c.md'].should.have.property('content', 'this is content');

    files['a/b/a.md'].should.have.property('locals', { a: 'b' });
    files['a/b/b.md'].should.have.property('locals', { a: 'b' });
    files['a/b/c.md'].should.have.property('locals', { a: 'b' });

    files['a/b/a.md'].should.have.property('options', { c: true } );
    files['a/b/b.md'].should.have.property('options', { c: true } );
    files['a/b/c.md'].should.have.property('options', { c: true } );
  });
});





// var foo = loader.normalize({content: 'this is foo'});
// var foo = loader.normalize({path: 'a/b/c.md'});

// 1st
// var foo = loader.normalize({path: 'a/b/c.md', content: 'this is foo'}, {foo: 'bar'});

// 2nd arg is options
// in the inner obejct => forIn()
//   - if it has `content` or `path` it's a template
//   -
// var bar = loader.normalize({
//   'a/b/d.md': {content: 'this is bar'},
//   'a/b/d.md': {content: 'this is bar'},
//   'a/b/d.md': {content: 'this is bar'},
//   'a/b/d.md': {content: 'this is bar'},
//   'a/b/d.md': {content: 'this is bar'}
// }, {a: 'b'}, {foo: 'bar'});

// 3rd arg is options
// var baz = loader.normalize('a/b/c.md', {content: 'this is baz', a: 'b'}, {foo: 'bar'});
// var baz = loader.normalize('a/b/c.md', {content: 'this is baz', a: 'b', options: {foo: 'bar'}}, {foo: 'bar'});

// // 4th arg is options
// var quux = loader.normalize('a/b/c.md', 'this is quux', {a: 'b'}, {foo: 'bar'});



// var o = {
//   path: 'a',
//   locals: {},
//   content: ''
// };

// var types = {
//   path: 'string',
//   locals: 'object',
//   content: 'string',
//   options: 'object'
// };

// var a = {
//   a: 'a',
//   b: 'b'
// };

// var b = {
//   c: 'c',
//   d: 'd'
// };

// console.log(hasTypes(o, types))
// console.log(extendProps(a, b, ['a', 'c', 'd']))



// var o = {
//   path: 'a',
//   foo: 'bar',
//   baz: 'quux',
//   locals: {a: 'b'},
//   content: 'this is content'
// };

// console.log(pick(o, ['path', 'content']))




