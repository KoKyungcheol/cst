import { checkUserPermission } from '../utils';

const EXCEL_IMPORT_COMPONENT = 'excel-import';

Vue.component(EXCEL_IMPORT_COMPONENT, {
  props: {},
  data() {
    return {};
  },
  methods: {
    onClick() {
      let checkPermission = checkUserPermission(gOperationType.IMPORT);
      if(checkPermission) {
        let upload = this.$refs.upload.kendoWidget();
        upload.element.trigger('click');
      }
    },
    onSelect(e) {
      this.$emit('select', e);
    },
    onSuccess(e) {
      this.$emit('success', e);
    },
    onComplete(e) {
      this.$emit('complete', e);
    },
    onError(e) {
      this.$emit('error', e);
    },
    onUpload(e) {
      let xhr = e.XMLHttpRequest;

      xhr.addEventListener('readystatechange', function (e) {
        if (xhr.readyState == 1) {
          xhr.setRequestHeader('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'));
          xhr.setRequestHeader('X-AUTH-TOKEN', localStorage.getItem('X-AUTH-TOKEN'));
        }
      });

      //this.$emit('upload', e);
    }
  },
  template: `
    <span class="excel-import">
      <kendo-button v-on:click="onClick"><i class="fa fa-lg fa-upload"></i></kendo-button>
      <div style="display:none;">
        <kendo-upload
          id="xls"
          ref="upload"
          name="file"
          :multiple="false"
          :async-save-url="'excel-import'"
          @select="onSelect"
          @success="onSuccess"
          @error="onError"
          @upload="onUpload"
          @complete="onComplete">
        </kendo-upload>
      </div>
    </span>
  `
});
