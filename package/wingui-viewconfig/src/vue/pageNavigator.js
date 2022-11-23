import { gI18n } from './i18n';

const PAGE_NAVIGATOR_COMPONENT = 'page-navigator';

Vue.component(PAGE_NAVIGATOR_COMPONENT, {
  props: ['settings'],
  data: function () {
    return {
      tooltip: gI18n.tc('MSG_5130')
    };
  },
  methods: {
    doSetPageSize: function (e) {
      this.settings.perPageSize = e.dataItem;
      this.doFirstPage();
    },
    doMovePage: function (page) {
      let current = this.settings.currentPage;
      if (current < 0 || !current) {
        this.doFirstPage();
      } else if (current > this.settings.totalPages) {
        this.doLastPage();
      } else {
        this.$emit('paging', page);
      }
    },
    doMoveCurrentPage: function () {
      this.doMovePage(this.settings.currentPage);
    },
    doFirstPage: function () {
      // 첫 페이지로 이동
      this.$emit('paging', 1);
    },
    doPrevPage: function () {
      //이전 페이지로 이동
      this.doMovePage(this.settings.currentPage - 1);
    },
    doNextPage: function () {
      //다음 페이지로 이동
      this.doMovePage(this.settings.currentPage + 1);
    },
    doLastPage: function () {
      //마지막 페이지로 이동
      this.$emit('paging', this.settings.totalPages);
    }
  },
  computed: {
    isPaging: function () {
      if (this.settings.totalPages > 0) {
        return true;
      } else {
        return false;
      }
    },
    isFirstPage: function () {
      return this.settings.currentPage <= 1;
    },
    isLastPage: function () {
      return this.settings.currentPage >= this.settings.totalPages;
    }
  },
  template: `
    <div class="wingui_pagingArea" style="height: 4%;padding-top: 3px;">
      <div class="leftCon" v-if="settings.comboboxUse">
        <kendo-dropdownlist id="rowsPerPage" v-model.number="settings.perPageSize" @select="doSetPageSize"
          :data-source="settings.dataSourceArray" :title="tooltip"
          style="width:180px;">
        </kendo-dropdownlist>
      </div>
      <div class="rightCon">
        <kendo-button @click="doFirstPage" :disabled="!isPaging||isFirstPage">
          <i class="fa fa-lg fa-angle-double-left"></i>
        </kendo-button>
        <kendo-button @click="doPrevPage" :disabled="!isPaging||isFirstPage">
          <i class="fa fa-lg fa-angle-left"></i>
        </kendo-button>
        <input id="settings.totalPages" type="number" min="1" :max="settings.totalPages" class="pagingNumber"
          v-model.number="settings.currentPage" @keyup.enter="doMoveCurrentPage"
          :disabled="!isPaging">
        </input>
        <span class="pagingText" v-if="isPaging">{{"of " + settings.totalPages}}</span>
        <kendo-button @click="doNextPage" :disabled="!isPaging||isLastPage">
          <i class="fa fa-lg fa-angle-right"></i>
        </kendo-button>
        <kendo-button @click="doLastPage" :disabled="!isPaging||isLastPage">
          <i class="fa fa-lg fa-angle-double-right"></i>
        </kendo-button>
      </div>
    </div>
  `
});
