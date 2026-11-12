import test from 'node:test';import assert from 'node:assert/strict';
import {compareDocumentSections}from '../src/index.mjs';const section=text=>({id:'dose',text,sourceUrl:'https://example.invalid/fixture'});
test('numeric dose change remains material text change',()=>{const x=compareDocumentSections([section('50 mg')],[section('500 mg')]);assert.equal(x.sections[0].state,'text_changed');assert.equal(x.clinicalMeaningInferred,false);});
test('PDF wrapping separated but not overwritten',()=>assert.equal(compareDocumentSections([section('50\n mg')],[section('50 mg')]).sections[0].state,'whitespace_only'));
test('removed section distinct from empty unchanged text',()=>assert.equal(compareDocumentSections([section('')],[]).sections[0].state,'removed'));
