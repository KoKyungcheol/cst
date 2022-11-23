# -*- coding: utf-8 -*-

import gspread
from oauth2client.service_account import ServiceAccountCredentials
import xml.etree.ElementTree as ET

# ISO 3166 https://www.iso.org/iso-3166-country-codes.html
# pip install gspread
# pip install --upgrade oauth2client

class ISO3166:
    def __init__(self):
        self.scopes = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        self.iso3166_url = 'https://docs.google.com/spreadsheets/d/1CQNyom8nRC9J_ALFhX-aF1aeaCCJdwm60QWpRqIX5JQ/edit#gid=0'

        self.path = './iso_4217.xml'
        self.js_path = '../src/lang/countryData.js'

    def authorize(self):
        print('Authorizing with google credentials...')
        credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', self.scopes)
        self.gc = gspread.authorize(credentials)

    def make_js_file(self):
        print('Making js file to %s...' % self.js_path)

        doc = self.gc.open_by_url(self.iso3166_url)
        sheet = doc.worksheet('ISO3166')

        col_names = ['COUNTRY_NAME', 'COUNTRY_CODE', 'ALPHA2_CODE', 'ALPHA3_CODE', 'NUMBER']
        col_name_dict = {}

        code_list = []
        code_list += ['const countryData = {\n']

        country_format = '  %s: {\n    name: \'%s\',\n    code: \'%s\',\n    alpah2: \'%s\',\n    alpah3: \'%s\',\n    number: \'%s\',\n    currency: \'%s\'\n  },\n'

        tree = ET.parse(self.path)

        currency_dict = {}

        root = tree.find('./CcyTbl')
        for currency in root.findall('./CcyNtry'):
            ccy = currency.find('Ccy')
            if ccy is None:
                continue

            currency_code = ccy.text
            country = currency.find('CtryNm').text.replace('\'', '\\\'').upper()
            currency_dict[country] = currency_code

        row_index = -1
        for row in sheet.get_all_values():
            row_index += 1
            if row_index == 0:
                col_index = -1
                for col in row:
                    col_index += 1
                    if col in col_names:
                        col_name_dict[col] = col_index

                continue

            if len(col_name_dict.keys()) != 5:
                print('The number of matching columns is insufficient.')
                break

            name = row[col_name_dict['COUNTRY_NAME']]
            code = row[col_name_dict['COUNTRY_CODE']]
            alpah2 = row[col_name_dict['ALPHA2_CODE']]
            alpah3 = row[col_name_dict['ALPHA3_CODE']]
            number = row[col_name_dict['NUMBER']]

            if code == '':
                continue

            name = name.replace('\'', '\\\'')

            if name.upper() not in currency_dict:
                print('The currency code for the country does not exist. (country nane: %s)' % name)
                continue

            currency = currency_dict[name.upper()]

            country_info = country_format % (alpah2, name, code, alpah2, alpah3, number, currency)
            code_list += [country_info]

        size = len(code_list)
        code = code_list[size-1]
        code_list[size-1] = code[:len(code)-2] + '\n'

        code_list += ['};\n\nexport default countryData;\n']

        with open(self.js_path, 'w') as f:
            for code in code_list:
                f.write(code)

def main():
    iso_3166 = ISO3166()
    iso_3166.authorize()
    iso_3166.make_js_file()

if __name__ == '__main__':
    main()
