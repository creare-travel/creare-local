import enDictionary from '@/locales/en.json';

export type Dictionary = typeof enDictionary;

type Primitive = string | number | boolean | null;

type DotPrefix<TPrefix extends string, TKey extends string> = TPrefix extends ''
  ? TKey
  : `${TPrefix}.${TKey}`;

type RecursiveKeyOf<TValue, TPrefix extends string = ''> = TValue extends Primitive
  ? never
  : {
      [TKey in keyof TValue & string]: TValue[TKey] extends Primitive
        ? DotPrefix<TPrefix, TKey>
        : DotPrefix<TPrefix, TKey> | RecursiveKeyOf<TValue[TKey], DotPrefix<TPrefix, TKey>>;
    }[keyof TValue & string];

export type DictionaryKey = RecursiveKeyOf<Dictionary>;
