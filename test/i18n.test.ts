/* tslint:disable only-arrow-functions */
import { expect } from 'chai';
import { LanguageResourceManager } from '../src/i18n';
import { langEn } from '../src/i18n/langResources';
import { LangResourceKeys } from '../src/models/i18n';

import * as packageJson from '../../package.json';
import * as nls from '../../package.nls.json';
import * as nlsTemplate from '../../package.nls.template.json';

describe('i18n: tests', function () {

  context('ensure that', function () {

    it('LangResourceKeys properties match ILangResource properties',
      function () {
        for (const key in LangResourceKeys) {
          // We only care about the enum members not the values
          if (isNaN(parseInt(key, 10))) {
            expect(Reflect.has(langEn, key)).to.be.true;
          }
        }
      });

    it('ILangResource properties match LangResourceKeys properties',
      function () {
        for (const key in langEn) {
          if (Reflect.has(langEn, key)) {
            expect(LangResourceKeys[key]).to.exist;
          }
        }
      });

    it('OS specific messages are properly shown',
      function () {
        const resourceCollection = {
          test: {
            activationPath: {
              darwin: 'Macintosh',
              linux: 'Linux',
              win32: 'Windows',
            },
          },
        };
        const msg = new LanguageResourceManager('test', resourceCollection).getMessage(LangResourceKeys.activationPath);
        expect(msg).to.equal(resourceCollection.test.activationPath[process.platform]);
      });

    it('a combination of resource and literal messages are properly shown',
      function () {
        const resourceCollection = {
          en: {
            newVersion: 'brave flees',
            restart: 'jumped over the fence',
          },
        };
        const literalString1 = '10';
        const literalString2 = ' ';
        const literalString3 = '!';
        const msg = new LanguageResourceManager('en', resourceCollection).getMessage(
          literalString1,
          literalString2,
          LangResourceKeys.newVersion,
          literalString2,
          LangResourceKeys.restart,
          literalString3);
        const expectedMsg = `${literalString1}${literalString2}${resourceCollection.en.newVersion}` +
          `${literalString2}${resourceCollection.en.restart}${literalString3}`;
        expect(msg).to.equal(expectedMsg);
      });

    it('if a language resource does not exist, the English resource is used',
      function () {
        const resourceCollection = {
          en: {
            restart: 'Test',
          },
        };

        const msg = new LanguageResourceManager('en', resourceCollection).getMessage(LangResourceKeys.restart);
        expect(msg).to.equal(resourceCollection.en.restart);
      });

    it('if no resource collection is provided, an empty string is returned',
      function () {
        const msg = new LanguageResourceManager('en', {}).getMessage(undefined);
        expect(msg).to.equal('');
      });

    context('the message is properly shown for', function () {

      let resourceCollection: any;

      before(() => {
        resourceCollection = {
          en: {
            newVersion: '10 brave flees jumped ',
            activationPath: 'over the fence',
          },
        };
      });

      it('a literal string',
        function () {
          const literalString = 'test';
          const msg = new LanguageResourceManager('en', resourceCollection).getMessage(literalString);
          expect(msg).to.equal(literalString);
        });

      it('a literal string with punctuation marks',
        function () {
          const literalString = 'test\'s can often fail. Or do they?';
          const msg = new LanguageResourceManager('en', resourceCollection).getMessage(literalString);
          expect(msg).to.equal(literalString);
        });

      it('an array of literal strings',
        function () {
          const literalString1 = '10';
          const literalString2 = ' brave flees jumped ';
          const literalString3 = 'over the fence.';
          const msg = new LanguageResourceManager('en', resourceCollection)
            .getMessage(literalString1, literalString2, literalString3);
          expect(msg).to.equal(`${literalString1}${literalString2}${literalString3}`);
        });

      it('an array of LangResourceKeys',
        function () {
          const msg = new LanguageResourceManager('en', resourceCollection)
            .getMessage(LangResourceKeys.newVersion, ' ', LangResourceKeys.activationPath);
          expect(msg).to.equal(`${resourceCollection.en.newVersion} ${resourceCollection.en.activationPath}`);
        });

      context('otherwise an error is thrown for invalid', function () {

        it('resource keys',
          function () {
            const i18nManager = new LanguageResourceManager('en', resourceCollection);
            expect(i18nManager.getMessage.bind(i18nManager, LangResourceKeys.restart))
              .to.throw(Error, /is not valid/);
          });

        it('characters',
          function () {
            const literalString = '#';
            const i18nManager = new LanguageResourceManager('en', resourceCollection);
            expect(i18nManager.getMessage.bind(i18nManager, literalString)).to.throw(Error, /is not valid/);
          });

      });

    });

    context('each', function () {

      it('command title has an nls entry',
        function () {
          const json = packageJson as any;
          expect(json.contributes).to.exist;
          expect(json.contributes.commands).to.exist;
          expect(json.contributes.commands).to.be.an.instanceOf(Array);
          json.contributes.commands.forEach((command) => {
            const title = command.title as string;
            const nlsEntry = title.replace(/%/g, '');
            expect(title).to.exist;
            expect(title).to.be.a('string');
            expect(nls[nlsEntry]).to.exist;
          });
        });

      it('configuration title has an nls entry',
        function () {
          const json = packageJson as any;
          expect(json.contributes).to.exist;
          expect(json.contributes.configuration).to.exist;
          const title = json.contributes.configuration.title as string;
          const nlsEntry = title.replace(/%/g, '');
          expect(title).to.exist;
          expect(title).to.be.a('string');
          expect(nls[nlsEntry]).to.exist;
        });

      it('configuration description has an nls entry',
        function () {
          const json = packageJson as any;
          expect(json.contributes).to.exist;
          expect(json.contributes.configuration).to.exist;
          const properties = json.contributes.configuration.properties;
          expect(properties).to.exist;
          expect(properties).to.be.an.instanceOf(Object);
          for (const prop in properties) {
            if (!Reflect.has(properties, prop)) {
              continue;
            }
            const description = properties[prop].description as string;
            const nlsEntry = description.replace(/%/g, '');
            expect(description).to.exist;
            expect(description).to.be.a('string');
            expect(nls[nlsEntry]).to.exist;
          }
        });

    });

    context('nls', function () {

      it('match nls template',
        function () {
          for (const key in nls) {
            if (Reflect.has(nls, key)) {
              expect(nlsTemplate[key]).to.exist;
            }
          }
        });

      it('template match nls',
        function () {
          for (const key in nlsTemplate) {
            if (Reflect.has(nlsTemplate, key)) {
              expect(nls[key]).to.exist;
            }
          }
        });

    });

  });

});
