# -*- coding: utf-8 -*-

import gspread
from oauth2client.service_account import ServiceAccountCredentials
import xml.etree.ElementTree as ET

# ISO 369 https://www.iso.org/iso-639-language-codes.html
# pip install gspread
# pip install --upgrade oauth2client

class ISO369:
    def __init__(self):
        self.scopes = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        self.iso369_url = 'https://docs.google.com/spreadsheets/d/1aahNMzPxiOOTfbqfojSoWb32Att7qBEWxzN73xqH9Lo/edit#gid=0'

        self.js_path = '../src/lang/languageData.js'

    def authorize(self):
        print('Authorizing with google credentials...')
        credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', self.scopes)
        self.gc = gspread.authorize(credentials)

    def make_js_file(self):
        print('Making js file to %s...' % self.js_path)

        doc = self.gc.open_by_url(self.iso369_url)
        sheet = doc.worksheet('ISO369')

        col_names = ['LANUGAGE_CODE', 'LANUGAGE_NAME']
        col_name_dict = {}

        code_list = []
        code_list += ['const languageData = {\n']

        language_format = '  \'%s\': {\n    code: \'%s\',\n    name: \'%s\'\n  },\n'

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

            if len(col_name_dict.keys()) != 2:
                print('The number of matching columns is insufficient.')
                break

            code = row[col_name_dict['LANUGAGE_CODE']]
            name = row[col_name_dict['LANUGAGE_NAME']]

            if code == '':
                continue

            name = name.replace('\'', '\\\'')

            language_info = language_format % (code, code, name)
            code_list += [language_info]

        size = len(code_list)
        code = code_list[size-1]
        code_list[size-1] = code[:len(code)-2] + '\n'

        code_list += ['};\n\nexport default languageData;\n']

        with open(self.js_path, 'w') as f:
            for code in code_list:
                f.write(code)

def main():
    iso_369 = ISO369()
    iso_369.authorize()
    iso_369.make_js_file()

if __name__ == '__main__':
    main()
