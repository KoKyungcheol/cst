import { gI18n } from './i18n';

Vue.component('common-window', {
  props: ['type','subType'],
  data() {
    return {
      title: '',
      actions: [],
      psnlWidget: null,
      width: '',
      height: '',
      popGrid: null
    };
  },
  computed: {
  },
  methods: {
    loadGrid: function () {
      gCreateGrid(this.popGrid);
    },
    removeGrid: function () {
      this.popGrid = null;
    },
    setGridInWindow () {
      return new Vue({
        el: '#psnlPopupGrid',
        i18n: gI18n,
        data: function() {
          return {
            gridView: null,
            dataProvider: null,
            fields:[
              { fieldName: 'fieldId' },
              { fieldName: 'fieldNm' },
              { fieldName: 'fieldNmVal' },
              { fieldName: 'active' },
              { fieldName: 'seq' },
              { fieldName: 'fieldWidth', dataType: 'number' },
            ],
            columns: [{
              name: 'fieldId',
              fieldName: 'fieldId',
              header: {
                text: gI18n.tc('FIELD_ID')
              },
              width: 100
            },{
              name: 'fieldNm',
              fieldName: 'fieldNm',
              header: {
                text: gI18n.tc('FIELD_NM')
              },
              width: 100
            },{
              name: 'fieldNmVal',
              fieldName: 'fieldNmVal',
              header: {
                text: gI18n.tc('FIELD_NM_VAL')
              },
              width: 100
            },{
              name: 'active',
              fieldName: 'active',
              header: {
                text: gI18n.tc('ACTV_YN')
              },
              width: 100
            },{
              name: 'seq',
              fieldName: 'seq',
              header: {
                text: gI18n.tc('SEQ')
              },
              width: 100
            },{
              name: 'fieldWidth',
              fieldName: 'fieldWidth',
              header: {
                text: gI18n.tc('FIELD_WDTH')
              },
              width: 100
            }]
          }
        }
      })
    },
    open: function () {
      this.$refs[this.$props.type].kendoWidget().center().open();
    },
    close: function () {
      this.$refs[this.$props.type].kendoWidget().close();
    }
  },
  mounted: function () {
    console.log(this);

    if (this.$props.type === 'preference') {
      this.title = gI18n.tc('PREF');
      this.width = '700px';
      this.height = '560px';
      this.actions = ['Refresh', 'Minimize', 'Maximize', 'Close'];

      this.popGrid = this.setGridInWindow();

    } else if (this.$props.type === 'help') {
      this.title = gI18n.tc('HELP');
      this.width = '700px';
      this.height = '560px';
      this.actions = ['Refresh', 'Minimize', 'Maximize', 'Close'];

      this.popGrid = this.setGridInWindow();
    }
  },
  template: `
    <kendo-window :id=type :ref=type :actions=actions :width="width" :height="height" :title="title" :modal="true" @activate="loadGrid" @deactivate="removeGrid" style="display:none" class="kd_windowWrap">
      <div>
        <div class="popup_area">
          <template v-if="type === 'preference'">
            <div class="component_ui kd_comboBoxWrap">
              <label class="kd_comboBoxLabel">
                <span class="kd_comboBoxLabelText" style="margin: 0px 5px;" v-t="'GRID'"></span>
                <kendo-combobox style="width:200px" ></kendo-combobox>
              </label>
            </div>
            <kendo-tabstrip style="height: 100%;">
              <ul>
                <li class="k-state-active">
                  <p v-t="'FIELD_PREF'"></p>
                </li>
              </ul>
              <div style="display: block;" class="centerWrap" >
                <div class="parentCon">
                  <div class="rightCon">
                    <kendo-button @click=""><i class="fa fa-lg fa-save"></i></kendo-button>
                    <kendo-button @click=""><i class="fa fa-lg fa-refresh"></i></kendo-button>
                  </div>
                </div>
                <div style="height: 380px; margin-top:10px; margin-bottom: 0px;" class="component_ui wingui_component">
                  <div id="psnlPopupGrid" style="width: 100%; height: 340px;"></div>
                </div>
              </div>
            </kendo-tabstrip>
          </template>
          <template v-if="type === 'help'">
            <template v-if="subType === 'UrlPage'">
              <iframe>aaa</iframe>
            </template>
          </template>
        </div>
      </div>
    </kendo-window>
  `
});
