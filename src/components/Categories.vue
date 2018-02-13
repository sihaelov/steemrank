<template>
  <div class="categories">

    <el-card style="max-width: 500px; margin: 50px auto;">

      <el-table :data="topCategories" v-loading="isLoading">
        <el-table-column prop="category" label="Category">
          <template slot-scope="scope">
            <a :href="`https://steemit.com/trending/${scope.row.category}`" target="_blank">
              {{scope.row.category}}
            </a>
          </template>
        </el-table-column>

        <el-table-column prop="pending_payout_value" label="Pending payout" width="120">
          <template slot-scope="scope">
            ${{formatPendingPayout(scope.row.pending_payout_value)}}
          </template>
        </el-table-column>

        <el-table-column prop="children" label="Comments" width="90">
          <template slot-scope="scope">
            {{formatNumber(scope.row.children)}}
          </template>
        </el-table-column>

        <el-table-column prop="net_votes" label="Votes" width="65">
          <template slot-scope="scope">
            {{formatNumber(scope.row.net_votes)}}
          </template>
        </el-table-column>

      </el-table>

    </el-card>

  </div>
</template>

<script>

import { Card, Table, TableColumn } from 'element-ui';
import formatNumberMixin from '@/utils/FormatNumber';


export default {
  name: 'Homepage',
  components: {
    'el-card': Card,
    'el-table': Table,
    'el-table-column': TableColumn,
  },
  mixins: [formatNumberMixin],
  data() {
    return {
      isLoading: false,
      activeSorter: 'pending_payout_value',
      topCategories: [],
    };
  },
  methods: {
    changeSorter(menuSorter) {
      this.activeSorter = menuSorter;
      this.authors = [];
      this.lastProfileValue = 999999;
      this.loadData();
    },

    isActiveSorter(menuSorter) {
      return this.activeSorter === menuSorter;
    },

    loadTopCategories() {
      this.isLoading = true;

      const sqlTopCategoriesBase = `
        SELECT TOP 100
          category,
          SUM(Comments.pending_payout_value) as pending_payout_value,
          SUM(Comments.children) as children,
          SUM(Comments.net_votes) as net_votes,
          COUNT(*) as posts
        FROM Comments
        WHERE depth=0 AND created BETWEEN GETDATE()-7 AND GETDATE()
        GROUP BY category
        ORDER BY SUM(Comments.{sorter}) DESC
      `;

      const sqlTopCategories = sqlTopCategoriesBase.replace(/{sorter}/g, this.activeSorter);

      const ajaxData = {
        query: sqlTopCategories,
      };

      fetch('https://sql.steemhelpers.com/api', {
        method: 'post',
        headers: {
          'Content-type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(ajaxData),
        mode: 'cors',
        dataType: 'json',
      })
        .then((response) => {
          this.isLoading = false;

          if (response.status >= 400 && response.status < 600) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((data) => {
          this.topCategories = data.rows;
        })
        .catch((error) => {
          console.log('Request failed', error);
          // Materialize.toast('Error!', 4000);
        });
    }, // loadTopCategories

    formatPendingPayout(pendingPayoutRaw) {
      const pendingPayout = Math.round(Number.parseFloat(pendingPayoutRaw));
      return this.formatNumber(pendingPayout);
    },

  },
  mounted() {
    this.loadTopCategories();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>


</style>
