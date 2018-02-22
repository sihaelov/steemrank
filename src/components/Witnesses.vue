<template>
  <div class="witnesses">

    <el-card style="max-width: 500px; margin: 50px auto;">

      <el-table
        :data="witnessList"
        v-loading="isLoading"
        @row-click="openWitnessDetails"
        class="witness-table">

          <el-table-column type="index" width="50"></el-table-column>
          <el-table-column prop="name" label="Name"></el-table-column>
          <el-table-column prop="votes" label="Votes (VESTS)" width="130">
            <template slot-scope="scope">
              {{formatNumberWithGroupSeparators(scope.row.votes)}}M
            </template>
          </el-table-column>
          <el-table-column prop="votes_count" label="Votes count">
            <template slot-scope="scope">
              {{formatNumberWithGroupSeparators(scope.row.votes_count)}}
            </template>
          </el-table-column>

          <!--
          <el-table-column prop="pending_payout_value" label="Pending payout" width="120">
            <template slot-scope="scope">
              ${{formatPendingPayout(scope.row.pending_payout_value)}}
            </template>
          </el-table-column>

          <el-table-column prop="net_votes" label="Votes" width="65">
            <template slot-scope="scope">
              {{formatNumber(scope.row.net_votes)}}
            </template>
          </el-table-column>
           -->
      </el-table>
    </el-card>

    <div v-if="currentWitness">
      <el-dialog
        :visible.sync="dialogVisible"
        custom-class="witness-details"
        :before-close="handleCloseDialog"
        top="5vh">

          <span slot="title" class="el-dialog__title">
            <a :href="`https://steemit.com/@${currentWitness.name}`" target="_blank">
              {{currentWitness.name}}
            </a>
          </span>

          <el-table :data="witnessVoters" v-loading="isLoadingWitnessDetails">
            <el-table-column prop="name" label="Name">
              <template slot-scope="scope">
                <a :href="`https://steemit.com/@${scope.row.name}`" target="_blank">
                  {{scope.row.name}}
                </a>
              </template>
            </el-table-column>

            <el-table-column prop="total_vests" label="Total VESTS">
              <template slot-scope="scope">
                {{renderVests(scope.row.total_vests)}}M
              </template>
            </el-table-column>
            <el-table-column prop="own_vests" label="Own VESTS">
              <template slot-scope="scope">
                {{renderVests(scope.row.own_vests)}}M
              </template>
            </el-table-column>
            <el-table-column prop="proxied_vests" label="Proxied VESTS">
              <template slot-scope="scope">
                {{renderVests(scope.row.proxied_vests)}}M
              </template>
            </el-table-column>

          </el-table>

      </el-dialog>
    </div>

  </div>
</template>

<script>

import { Card, Table, TableColumn, Dialog } from 'element-ui';
import formatNumberMixin from '@/utils/FormatNumber';

export default {
  name: 'Witnesses',
  components: {
    'el-card': Card,
    'el-table': Table,
    'el-table-column': TableColumn,
    'el-dialog': Dialog,
  },
  mixins: [formatNumberMixin],
  data() {
    return {
      isLoading: false,
      witnessList: [],
      dialogVisible: false,
      currentWitness: null,
      witnessVoters: [],
      isLoadingWitnessDetails: false,
    };
  },
  methods: {
    changeSorter(menuSorter) {
      this.activeSorter = menuSorter;
      this.authors = [];
      this.lastProfileValue = 999999;
      this.loadData();
    },

    openWitnessDetails(witness) {
      if (this.currentWitness) {
        return;
      }

      this.currentWitness = witness;
      this.dialogVisible = true;
      this.isLoadingWitnessDetails = true;

      const sql = `
        SELECT TOP 100
          accountsTable.name,
          ISNULL(proxyTable.proxied_vests, 0) as proxied_vests,
          mainSteemPowerTable.own_vests,

          (mainSteemPowerTable.own_vests + ISNULL(proxyTable.proxied_vests, 0)) AS total_vests,

          accountsTable.witness_votes,
          accountsTable.witnesses_voted_for
        FROM 
          (
            SELECT name, vesting_shares, witness_votes, witnesses_voted_for
            FROM Accounts
            WHERE proxy='' AND witness_votes LIKE '%${witness.name}%'
          ) accountsTable
          LEFT JOIN
          (
            SELECT
              proxy,
              sum(proxySteemPowerTable.vesting_shares) AS proxied_vests
            FROM
              Accounts
              LEFT JOIN (
                SELECT
                  name,
                  (SELECT TOP 1 convert(float,value) FROM STRING_SPLIT(vesting_shares, ' ')) as vesting_shares
                FROM Accounts
              ) as proxySteemPowerTable
              ON Accounts.name = proxySteemPowerTable.name
            WHERE proxy != ''
            GROUP BY proxy
          ) proxyTable
          ON accountsTable.name = proxyTable.proxy
          LEFT JOIN (
            SELECT
              name,
              (SELECT TOP 1 convert(float,value)
                FROM STRING_SPLIT(vesting_shares, ' ')
              ) as own_vests
              FROM Accounts
          ) as mainSteemPowerTable
          ON accountsTable.name = mainSteemPowerTable.name
        ORDER BY total_vests DESC
      `;

      const ajaxData = {
        query: sql,
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
          if (response.status >= 400 && response.status < 600) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((data) => {
          this.witnessVoters = data.rows;
          this.isLoadingWitnessDetails = false;
        })
        .catch((error) => {
          console.log('Request failed', error);
        });
    },

    handleCloseDialog(done) {
      if (this.isLoadingWitnessDetails) {
        alert('Please wait');
        return;
      }

      this.currentWitness = null;
      this.witnessVoters = [];
      done();
    },

    loadData() {
      this.isLoading = true;

      const sqlTopWitnesses = `
        SELECT TOP 200
          name,
          (votes  / 1000000000000) as votes,
          votes_count,
          running_version
        FROM Witnesses
        ORDER BY votes DESC
      `;

      const ajaxData = {
        query: sqlTopWitnesses,
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
          this.witnessList = data.rows;
        })
        .catch((error) => {
          console.log('Request failed', error);
          // Materialize.toast('Error!', 4000);
        });
    }, // loadData

    formatNumberWithGroupSeparators(number) {
      const nf = new Intl.NumberFormat('en-US');
      return nf.format(Number.parseInt(number));
    },

    renderVests(number) {
      return this.formatNumberWithGroupSeparators(number / 1000000);
    },

  },

  computed: {

  },
  mounted() {
    this.loadData();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

  .witnesses .witness-table .el-table__row:hover{
    cursor: pointer;
  }

</style>
