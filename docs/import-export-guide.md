# CSV File Import/Export를 위한 Meata 정보 JSON 파일 작성 방법

<br>

## 개요
- CSV File에 대한 Import/Export 작업을 위해서는 테이블 구조를 위한 JSON 파일 및 복합 쿼리를 위한 JSON 파일을 작성 하여야 한다.
- 각 JSON 파일은 resources/structure 폴더 내에 존재 하여야 한다.
- 테이블 구조 JSON 파일은 [테이블명.json](./src/main/resources/structure/IF_DP_ACCOUNT_MST.json)으로 생성 한다.
- 복합 쿼리를 위한 JSON 파일은 [모듈명_FILTERS.json](./src/main/resources/structure/DP_FILTERS.json)으로 생성 한다.

<br><br>
## 작성방법

1. 테이블 구조 JSON
   - Objects
        | Object | value | Not Null | Description | values |
        |--------|-------|:--------:|-------------|--------|
        | name | 테이블 명칭 | | 테이블 명칭을 그대로 입력 한다. |사용 하지 않아도 됨. 테이블 구분은 JSON파일 명칭을 이용함|
        | useDefaultSchema | 테이블 기본 스키마 사용 여부 | | 테이블 스키마를 이용하여 컬럼을 생성 할지 여부 | - null == "Y"<br> - "Y" : 테이블의 컬럼 스키마 정보를 이용하여 columns에 정의 되지 않은 컬럼을 자동으로 추가 한다 <br> - "N" : columns에 정의된 컬럼만 사용한다. |
        |of|Multi Column Validation을 위한 Array||여러개의 컬럼중 하나의 값이라도 있는 경우 Validation을 통과하고 우선순위 따라 지정된 값을 이용하여 저장
        | columns | 컬럼 정의를 위한 Array | O | | |
        <br>
   -  of array Objects
        | Object | value | Not Null | Description | values |
        |--------|-------|:--------:|-------------|--------|
        | groups | Validatation 묶음 | O | Validation 묶음 단위로 아래의 object들의 Array로 구성 ||
        | column | 컬럼명 | O | Validation에 사용할 컬럼명 |
        | priority | 우선순위 | O | 복수의 값이 있을 경우 적용될 우선순위 지정 | 낮은 숫자가 우선순위가 높음 |
        <br>
        - Example <br>

        ```json
        "of": [{
            "groups": [
                { "column": "SALES_LV_ID", "priority": "2" },
                { "column": "ACCOUNT_ID", "priority": "1" }
            ]
        }]
        ```
        <br>
        - SALES_LV_ID / ACCOUNT_ID 둘중 하나는 반드시 입력 되어야 한다. <br>
        - 만약 두개의 컬럼에 값이 있는경우 우선순위에 따라 ACCOUNT_ID에 만 값이 입력 된다. <br><br>

   - columns array Objects
        | Object | value | Not Null | Description | values |
        |--------|-------|:--------:|-------------|--------|
        | name | 컬럼 명칭 | O | 컬럼 명칭을 그대로 입력 한다. ||
        | type | 컬럼의 Data Type |  | 정의된 Data Type을 입력 한다. | - null : filter 나 exports에 정의된 type을 사용한다.<br><br> **Don't Use CSV File** <br> - "ID" : ID 생성을 위한 Data Type <br> - "NOW" : 현재시간 <br> - "USER_ID" : Login 사용자 정보 <br><br>**Use CSV File** <br> - "STRING" : 문자열 관련 Data Type <br> - "NUMBER" : 숫자 관련 Data Type <br> - "DATE" : 날짜 관련 Data Type (CSV 파일에서 강제로 날짜부분만 잘라내서 사용 됨) <br> - "DATE_TIME" : 날짜 + 시간 |
        | update | 업데이트 여부 | | 해당 컬럼이 업데이트 가능한지 여부를 입력한다. | - null == "Y" <br> - "Y" : 업데이트 가능 <br> - "N" : 업데이트 할 수 없음 |
        | unique | Unique 컬럼 여부 | | | - null == "N" <br> - "N" : <br> - "Y" : 업데이트 시 조건으로 사용되는 컬럼 (자동으로 update = "N"이 됨) |
        | header |CSV File의 헤더 명칭| |Import/Export시 각 CSV File의 헤더 명칭으로 사용된다. | - null : filter나 exports에 정의된 명칭으로 사용된다. |
        | filter | filter name | | 복합쿼리 JSON의 Filter Name | - null : filter 사용 하지 않음 |
        |outer|outer join 여부|  |Export시 조회 대상 테이블을 join 하는 방식 지정 | - null == "N" <br> - "N" : Export시 조회 대상 테이블을 INNER JOIN으로 join 한다. <br> - "Y" : Export시 조회 대상 테이블을 LEFT OUTER JOIN으로 join 한다. <br>**Filter 사용, 조회 관련 Object를 사용할 경우 둘다 outer에 설정된 옵션으로 조회 함** |
        
        <br>
    - ID를 찾기 위한 Code Table 관련 Objects (단일 테이블 조회 일 경우만 사용되며, 복합 테이블 조인이 필요한 경우는 FILTERS JSON을 이용 한다.)
        | Object | value | Not Null | Description | values |
        |--------|-------|:--------:|-------------|--------|
        |import_column|가져올 컬럼 명| O | Import시 컬럼에 저장될 조회 컬럼 명 | |
        |import_table|대상 테이블 명| O |조회 대상 테이블 명 | |
        |exports|검색 조건 Array| O | 아래의 Object들에 대해 Array로 작성 한다. |
        |header|CSV File의 헤더 명칭| O | Import/Export시 각 CSV File의 헤더 명칭으로 사용된다 |
        |type| Data Type | | 헤더의 Data Type | null : 컬럼의 Data Type을 사용한다. (컬럼과 헤더 양쪽 모두 Data Type이 없는 경우 Parsing Error 발생) <br>그 외 값은 컬럼의 Data Type과 동일 |
        |column| 컬럼 명 | O | 조회 대상 테이블의 컬럼 명으로 검색 조건으로 사용 된다 |
        |and|and 조건 Array|  | 아래의 Object들에 대해 Array로 작성 한다. | 필요한 경우에만 작성 |
        |column|컬럼명| O | 조회조건의 컬럼명 |
        |value| 조회값 | O | 조회할 값을 그대로 입력한다. |ex, '문자열' |
        |or|or 조건 Array|  | 아래의 Object들에 대해 Array로 작성 한다. | 필요한 경우에만 작성 |
        |column|컬럼명| O | 조회조건의 컬럼명 |
        |value| 조회값 | O | 조회할 값을 그대로 입력한다. |ex, '문자열' |
        

        - Example <br>
        ```json
            "name": "AUTH_TP_ID",
            "unique": "Y",
            "import_column": "ID",
            "import_table": "TB_CM_LEVEL_MGMT",
            "exports": [{
                "header": "AUTH_TP_CD",
                "type": "STRING",
                "column": "LV_CD"
            }],
            "and": [{
                    "column": "SALES_LV_YN",
                    "value": "'Y'"
                },
                {
                    "column": "ACTV_YN",
                    "value": "'Y'"
                }
            ],
            "or": [{
                    "column": "DEL_YN",
                    "value": "'N'"                
                },
                {
                    "column": "ACCOUNT_LV_YN",
                    "value": "'Y'"                
                }
            ]
        ```  

         - Import 시
            ```sql
                SELECT ID
                  FROM TB_CM_LEVEL_MGMT
                 WHERE LV_CD = 'CSV FILES VALUE' --CSV FILE의 헤더가 AUTH_TP_CD인 값
                   AND SALES_LV_YN = 'Y'
                   AND ACTV_YN = 'Y'
                   AND (    DEL_YN = 'N'
                        OR  ACCOUNT_LV_YN = 'Y'
                       )
            ```
       - Export 시
            ```sql
                SELECT LV_CD AS AUTH_TP_CD --CSV FILE의 헤더가 AUTH_TP_CD가 되고, LV_CD가 값이 된다.
                  FROM TB_CM_LEVEL_MGMT
                 WHERE ID = MAIN_TABLE.AUTH_TP_ID
                   AND SALES_LV_YN = 'Y'
                   AND ACTV_YN = 'Y'
                   AND (    DEL_YN = 'N'
                        OR  ACCOUNT_LV_YN = 'Y'
                       )
            ```
<br>   

1. Filters JSON
   - Objects
        | Object | value | Not Null | Description | values |
        |--------|-------|:--------:|-------------|--------|
        | name | filter name | O | 해당 JSON 내에서 유니크한 명칭 |
        |querys| 조회 Query Array | O | 아래의 Object들에 대해 Array로 작성 한다. |
        |type|조회 쿼리의 Type| O | | - "common" : DBMS종류와 상관이 없이 고통으로 사용 할 수 있는 쿼리 <br> - "mssql" : MS-SQL DBMS에서만 사용 할 수 있는 쿼리 <br> - "oracle" : ORACLE DBMS에서만 사용 할 수 있는 쿼리<br><br>**주의사항** <br>1. common 이 있는 경우 무조건 common 쿼리가 사용 됨 <br> 2. common 쿼리가 없고 하나의 DBMS에 대해서만 정의 한 경우 정의되지 않은 DBMS를 사용할 경우 Parsing Error가 발생 됨 |
        |query| SQL 구문 | O | |**주의사항**<br>1. SELECT 컬럼은 반드시 **#REPLACE_COLUMN_NAME#** 하나만 정의 하여야 한다. (컬럼 명칭은 아래의 오브젝트 들로 대체 됨)<br>2. WHERE절에 파라미터로 이용되어야 하는 조건은 입력하지 않는다. 즉, 파라미터 없이 전체 조회되는 쿼리만 입력한다. (WHERE 절은 아래의 오브젝트 들로 추가 생성 됨) |
        |import_column| 가져올 컬럼 명 | O | Import시 컬럼에 저장될 조회 컬럼 명|**주의사항**<br>조회 쿼리에서 사용된 alias 포함 컬럼 명칭을 그대로 입력 하여야 함 (ex, A.ID) |
        |import_column_alias|컬럼 alias | O | 위 컬럼에 대한 alias |아무 값이나 사용해도 무방함 |
        |exports|검색 조건 Array| O | 아래의 Object들에 대해 Array로 작성 한다. |
        |header|CSV File의 헤더 명칭| O | Import/Export시 각 CSV File의 헤더 명칭으로 사용된다 |
        |type| Data Type | | 헤더의 Data Type | null : 컬럼의 Data Type을 사용한다. (컬럼과 헤더 양쪽 모두 Data Type이 없는 경우 Parsing Error 발생) <br> 그 외 값은 컬럼의 Data Type과 동일 |
        |column| 컬럼 명 | O | 조회 대상 테이블의 컬럼 명으로 검색 조건으로 사용 된다 |**주의사항**<br>조회 쿼리에서 사용된 alias 포함 컬럼 명칭을 그대로 입력 하여야 함 (ex, B.INCOTERMS)|
        |
      - Example <br>
      ```json
            "name": "DP_LV_MGMT_ID",
            "querys": [{
                "type": "common",
                "query": "SELECT #REPLACE_COLUMN_NAME# FROM TB_CM_LEVEL_MGMT A INNER JOIN TB_CM_COMM_CONFIG B ON (A.LV_TP_ID = B.ID) WHERE B.CONF_GRP_CD = 'DP_LV_TP' AND B.CONF_CD = 'S'"
            }],
            "import_column": "A.ID",
            "import_column_alias": "ID",
            "exports": [{
                "header": "LV_MGMT_CD",
                "type": "STRING",
                "column": "A.LV_CD"
            }]
      ```  

       - Import 시
          ```sql
                  SELECT A.ID AS ID
                    FROM TB_CM_LEVEL_MGMT A 
              INNER JOIN TB_CM_COMM_CONFIG B
                      ON (A.LV_TP_ID = B.ID) 
                   WHERE B.CONF_GRP_CD = 'DP_LV_TP'
                     AND B.CONF_CD = 'S'
                     AND A.LV_CD = 'CSV FILES VALUE' --CSV FILE의 헤더가 LV_MGMT_CD인 값
          ```
     - Export 시
          ```sql
                  SELECT A.LV_CD AS LV_MGMT_CD --CSV FILE의 헤더가 LV_MGMT_CD가 되고, A.LV_CD가 값이 된다.
                    FROM TB_CM_LEVEL_MGMT A 
              INNER JOIN TB_CM_COMM_CONFIG B
                      ON (A.LV_TP_ID = B.ID) 
                   WHERE B.CONF_GRP_CD = 'DP_LV_TP'
                     AND B.CONF_CD = 'S'
                     AND A.ID = MAIN_TABLE.COLUMN_NAME --테이블 구조 JSON에 정의된 컬럼 명을 이용하여 생성 됨
          ```

<br><br>
## DATA Types
|JSON Data Type|Oracel Data Type|MSSQL Data Type|CSV|비고|
|--------------|----------------|------------|:-:|----|
|ID|TO_SINGLE_BYTE<br>(SYS_GUID())|REPLACE<br>(NEWID(),'-','')|X|
|NOW|SYSDATE|GETDATE()|X|
|USER_ID|'user id'|'user id'|X| user_id = UI로 부터 넘겨 받은 사용자 ID |
|STRING|CHAR(n)<br>VARCHAR2(n)<br>NCHAR(n)<br>NVARCHAR(n)<br>LONG | char[n]<br>varchar[n]<br>ntext, text<br>nchar[n]<br>nvarchar(n)|O | |
|NUMBER|NUMBER(P,S)<br>FLOAT(P)<br>BINARY_FLOAT<br>BINARY_DOUBLE|bigint<br>int<br>smallint<br>tinyint<br>Numeric<br>Decima<br>float<br>real|O| |
|DATE|DATE<br>TIMESTAMP|date<br>datetime<br>smalldatetime|O|강제로 날짜 길이 만큼 잘라서 사용 됨<br>Data에서 시간 부분이 필요 없는 경우 |
|DATE_TIME|DATE<br>TIMESTAMP|datetime<br>smalldatetime|O|전체 날짜 값을 사용<br>Data에서 시간 까지 필요 할 경우 사용<br>CSV파일내 DATA 형식에 주의 필요 (형변환 Error발생 확률이 높음) |
|사용불가| CLOB<br>NCLOB<br>BLOB<br>BFILE|binary[n]<br>image<br>datetime2<br>datetimeoffset<br>time<br>cursor<br>timestamp<br>rowversion<br>hierarcyid<br>uniqueidentifier<br>sql_variant<br>xml<br>table|

<br><br>
## Sample
- 대상 테이블 : TB_DP_ACCOUNT_MST
- 대상 테이블 구조
  |Column Name|Data Type|
  |-----------|--------:|
  |ID|CHAR|
  |ACCOUNT_CD|VARCHAR2|
  |ACCOUNT_NM|VARCHAR2|
  |PARENT_SALES_LV_ID|CHAR|
  |CURCY_CD_ID|CHAR|
  |COUNTRY_ID|CHAR|
  |CHANNEL_ID|CHAR|
  |SOLD_TO_ID|CHAR|
  |SHIP_TO_ID|CHAR|
  |BILL_TO_ID|CHAR|
  |INCOTERMS_ID|CHAR|
  |ATTR_01|VARCHAR2|
  |ATTR_02|VARCHAR2|
  |ATTR_03|VARCHAR2|
  |ATTR_04|VARCHAR2|
  |ATTR_05|VARCHAR2|
  |ATTR_06|VARCHAR2|
  |ATTR_07|VARCHAR2|
  |ATTR_08|VARCHAR2|
  |ATTR_09|VARCHAR2|
  |ATTR_10|VARCHAR2|
  |ATTR_11|VARCHAR2|
  |ATTR_12|VARCHAR2|
  |ATTR_13|VARCHAR2|
  |ATTR_14|VARCHAR2|
  |ATTR_15|VARCHAR2|
  |ATTR_16|VARCHAR2|
  |ATTR_17|VARCHAR2|
  |ATTR_18|VARCHAR2|
  |ATTR_19|VARCHAR2|
  |ATTR_20|VARCHAR2|
  |SRP_YN|CHAR|
  |VMI_YN|CHAR|
  |DIRECT_SHPP_YN|CHAR|
  |ACTV_YN|CHAR|
  |DEL_YN|CHAR|
  |CREATE_BY|VARCHAR2|
  |CREATE_DTTM|DATE|
  |MODIFY_BY|VARCHAR2|
  |MODIFY_DTTM|DATE|
  
  <br>
- 테이블 구조 JSON
  ```javascript
  {
    "name": "TB_DP_ACCOUNT_MST",    //작성 하지 않아도 됨

    "useDefaultSchema": "Y",
    /*
    colums array에 정의 되지 않은 ATTR_01 ~ ATTR_20 컬럼이 자동으로 추가 됨
    ("name":"ATTR_01", "type":"STRING", "update":"Y", "unique":"N", "header":"ATTR_01")형태가 됨
    type은 테이블 스키마의 컬럼 타입을 이용하여 변환 됨
    위 형태가 아닌 컬럼은 반드시 columns array에 정의 하여야 함
    */

    "columns": [{
            "name": "ID",
            "type": "ID",
            "update": "N"
            /*
            Update 할 수 없고
            Import시 DBMS에 맞는 ID 생성 쿼리가 실행 됨
            header가 없으므로 Export시 생성 되지 않음
            */
        },
        {
            "name": "ACCOUNT_CD",
            "type": "STRING",
            "header": "ACCOUNT_CD",
            "unique": "Y"   //Update시 Unique Key로 사용됨 (다수의 컬럼을 Unique Key로 사용 할 수 있음)
        },
        {
            "name": "ACCOUNT_NM",
            "type": "STRING",
            "header": "ACCOUNT_NM"
        },
        {
            "name": "PARENT_SALES_LV_ID",
            "import_column": "ID",
            "import_table": "TB_DP_SALES_LEVEL_MGMT",
            "exports": [{
                "header": "PARENT_SALES_LV_CD",
                "type": "STRING",
                "column": "SALES_LV_CD"
            }]
            /*
            //Import시
                SELECT ID
                  FROM TB_DP_SALES_LEVEL_MGMT
                 WHERE SALES_LV_CD = 'CSV FILES VALUE' --CSV FILE의 헤더가 PARENT_SALES_LV_CD인 값
                 
                 위 결과로 조회된 ID 값이 TB_DP_ACCOUNT_MST테이블의 PARENT_SALES_LV_ID 컬럼에 저장 됨
            */
            /*
            //Export시
                SELECT B.SALES_LV_CD AS PARENT_SALES_LV_CD
                  FROM (SELECT *
                          FROM TB_DP_ACCOUNT_MST) A
            INNER JOIN (SELECT SALES_LV_CD
                          FROM TB_DP_SALES_LEVEL_MGMT) B
                    ON (A.PARENT_SAELS_LV_ID = B.ID)

                위 결과로 조회 된 B.SALES_LV_CD 가 CSV File에 PARENT_SALES_LV_CD 헤더에 Export 됨
            */
        },
        {
            "name": "CURCY_CD_ID",
            "filter": "DP_CURCY_CD_ID"  //DP_FILTERS의 DP_CURCY_CD_ID name을 가지는 필터를 이용하여 생성 함
        },
        {
            "name": "COUNTRY_ID",
            "filter": "DP_COUNTRY_ID"
        },
        {
            "name": "CHANNEL_ID",
            "filter": "DP_CHANNEL_ID"
        },
        {
            "name": "SOLD_TO_ID",
            "type": "STRING",
            "import_column": "ID",
            "import_table": "TB_CM_CUSTOMER",
            "outer": "Y",
            "exports": [{
                "header": "SOLD_TO_CUST_CD",
                "column": "CUST_CD"
            }]

            //"outer":"Y"에 의해
            /*
            //Export시
                SELECT B.CUST_CD AS SOLD_TO_CUST_CD
                  FROM (SELECT *
                          FROM TB_DP_ACCOUNT_MST) A
       LEFT OUTER JOIN (SELECT CUST_CD
                          FROM TB_CM_CUSTOMER) B
                    ON (A.SOLD_TO_ID = B.ID)

                위 결과로 조회 된 B.SALES_LV_CD 가 CSV File에 SOLD_TO_CUST_CD 헤더에 Export 됨
            */
            //exports에 type이 없으므로 column에 정의된 "type":"STRING" type을 이용하여 파라미터가 생성 됨
        },
        {
            "name": "SHIP_TO_ID",
            "import_column": "ID",
            "import_table": "TB_CM_CUSTOMER",
            "outer": "Y",
            "exports": [{
                "header": "SHIP_TO_CUST_CD",
                "type": "STRING",
                "column": "CUST_CD"
            }]
        },
        {
            "name": "BILL_TO_ID",
            "import_column": "ID",
            "import_table": "TB_CM_CUSTOMER",
            "outer": "Y",
            "exports": [{
                "header": "BILL_TO_CUST_CD",
                "type": "STRING",
                "column": "CUST_CD"
            }]
        },
        {
            "name": "INCOTERMS_ID",
            "filter": "DP_INCOTERMS_ID"
        },
        {
            "name": "SRP_YN",
            "type": "STRING",
            "header": "SRP_YN"
        },
        {
            "name": "VMI_YN",
            "type": "STRING",
            "header": "VMI_YN"
        },
        {
            "name": "DIRECT_SHPP_YN",
            "type": "STRING",
            "header": "DIRECT_SHPP_YN"
        },
        {
            "name": "ACTV_YN",
            "type": "STRING",
            "header": "ACTV_YN"
        },
        {
            "name": "DEL_YN",
            "type": "STRING",
            "header": "DEL_YN"
        },
        {
            "name": "CREATE_BY",
            "type": "USER_ID",
            "update": "N"
        },
        {
            "name": "CREATE_DTTM",
            "type": "NOW",
            "update": "N"
        },
        {
            "name": "MODIFY_BY",
            "type": "USER_ID"
        },
        {
            "name": "MODIFY_DTTM",
            "type": "NOW"
        }
    ]
  }
  ```
<br>
- Filters JSON : Fiters JSON Object 설명 참조

  ```json
  {
    "FILTERS": [{
            "name": "DP_CURCY_CD_ID",
            "querys": [{
                "type": "common",
                "query": "SELECT #REPLACE_COLUMN_NAME# FROM TB_AD_COMN_GRP A INNER JOIN TB_AD_COMN_CODE B ON (A.ID = B.SRC_ID) WHERE A.GRP_CD = 'CURRENCY'"
            }],
            "import_column": "B.ID",
            "import_column_alias": "ID",
            "exports": [{
                "header": "CURCY_CD",
                "type": "STRING",
                "column": "B.COMN_CD"
            }]
        },

        {
            "name": "DP_COUNTRY_ID",
            "querys": [{
                "type": "common",
                "query": "SELECT #REPLACE_COLUMN_NAME# FROM TB_CM_COMM_CONFIG WHERE CONF_GRP_CD = 'CM_COUNTRY' AND ACTV_YN = 'Y'"
            }],
            "import_column": "ID",
            "import_column_alias": "ID",
            "exports": [{
                "header": "COUNTRY_CONF_CD",
                "type": "STRING",
                "column": "CONF_CD"
            }]
        },

        {
            "name": "DP_CHANNEL_ID",
            "querys": [{
                "type": "common",
                "query": "SELECT #REPLACE_COLUMN_NAME# FROM TB_CM_CONFIGURATION A INNER JOIN TB_CM_CHANNEL_TYPE B ON A.ID = B.CONF_ID WHERE B.ACTV_YN = 'Y'"
            }],
            "import_column": "B.ID",
            "import_column_alias": "ID",
            "exports": [{
                "header": "CHANNEL_NM",
                "type": "STRING",
                "column": "B.CHANNEL_NM"
            }]
        },

        {
            "name": "DP_INCOTERMS_ID",
            "querys": [{
                "type": "common",
                "query": "SELECT #REPLACE_COLUMN_NAME# FROM TB_CM_CONFIGURATION A INNER JOIN TB_CM_INCOTERMS B ON A.ID = B.CONF_ID WHERE A.CONF_NM = 'CM_INCOTERMS' AND B.ACTV_YN = 'Y'"
            }],
            "import_column": "B.ID",
            "import_column_alias": "ID",
            "exports": [{
                "header": "INCOTERMS",
                "type": "STRING",
                "column": "B.INCOTERMS"
            }]
        }
    ]
  }
  ```
<br><br>
## 마무리
UI 구성에 관한 설명은 별도 md file 참조


<br><br>

# - End of Document -