# -*- coding: utf-8 -*-

import urllib.request
import xml.etree.ElementTree as ET

# ISO 4217 https://www.iso.org/iso-4217-currency-codes.html

class ISO4217:
    def __init__(self):
        self.url = 'https://www.currency-iso.org/dam/downloads/lists/list_one.xml'
        self.path = './iso_4217.xml'
        self.js_path = '../src/lang/currencyData.js'

    def download(self):
        print('Downloading %s to %s...' % (self.url, self.path))

        urllib.request.urlretrieve(self.url, self.path)

    def make_js_file(self):
        print('Making js file to %s...' % self.js_path)

        tree = ET.parse(self.path)

        currency_dict = {}

        root = tree.find('./CcyTbl')
        for currency in root.findall('./CcyNtry'):
            ccy = currency.find('Ccy')
            if ccy is None:
                continue

            code = ccy.text
            name = currency.find('CcyNm').text
            number = currency.find('CcyNbr').text
            digits = currency.find('CcyMnrUnts').text
            country = currency.find('CtryNm').text

            if digits == 'N.A.':
                digits = '0'

            if code in currency_dict:
                currency_dict[code][3] += [country]
            else:
                currency_dict[code] = [number, digits, name, [country]]

        code_list = []
        code_list += ['const currencyData = {\n']

        currency_format = '  %s: {\n    code: \'%s\',\n    number: \'%s\',\n    digits: %s,\n    currency: \'%s\',\n    countries: [\n      %s\n    ]\n  },\n'
        for code in currency_dict:
            currency = currency_dict[code]
            countries = ['\'' + country.replace('\'', '\\\'') + '\'' for country in currency[3]]
            currency_info = currency_format % (code, code, currency[0], currency[1], currency[2], ',\n      '.join(countries))
            code_list += [currency_info]

        size = len(code_list)
        code = code_list[size-1]
        code_list[size-1] = code[:len(code)-2] + '\n'

        code_list += ['};\n\nexport default currencyData;\n']

        with open(self.js_path, 'w') as f:
            for code in code_list:
                f.write(code)

def main():
    iso_4217 = ISO4217()
    iso_4217.download()
    iso_4217.make_js_file()

if __name__ == '__main__':
    main()
