<template>
  <div class="bots">

    <h1>Top bots</h1>

    <el-card style="max-width: 300px; margin: 50px auto;">
      
      <el-table :data="tableData" v-loading="isLoading">
        <el-table-column prop="name" label="Name">
          <template slot-scope="scope">
            <a :href="`https://steemit.com/@${scope.row.name}`" target="_blank">@{{scope.row.name}}</a>
          </template>
        </el-table-column>

        <el-table-column prop="total_steem_power" label="Steem Power"></el-table-column>
      </el-table>

    </el-card>


  </div>
</template>

<script>

import { Card, Table, TableColumn } from 'element-ui';
import steem from 'steem';
import formatNumberMixin from '@/utils/FormatNumber';

steem.api.setOptions({ url: 'https://api.steemit.com' });

export default {
  name: 'Bots',
  components: {
    'el-card': Card,
    'el-table': Table,
    'el-table-column': TableColumn,
  },
  mixins: [formatNumberMixin],
  data() {
    return {
      isLoading: false,
      tableData: [],
    };
  },
  methods: {
    loadData() {
      this.isLoading = true;

      const botList = [
        'aksdwi',
        'boomerang',
        'appreciator',
        'buildawhale',
        'upmyvote',
        'sneaky-ninja',
        'upme',
        'jerrybanfield',
        'booster',
        'ipromote',
        'postpromoter',
        'allaz',
        'pushup',
        'minnowhelper',
      ];

      // SQL:
      // json_metadata, voting_power, reputation
      // vesting_shares, delegated_vesting_shares , received_vesting_shares

      // JS:
      // reward_vesting_balance: "2.047894 VESTS"
      // reward_vesting_steem:"0.001 STEEM"

      steem.api.getAccounts(botList, (getAccountsError, botAccountList) => {
        // console.log(getAccountsError, botAccountList);
        if (getAccountsError) {
          this.isLoading = false;
          this.$notify({ title: 'Error' });
          return;
        }
        this.tableData = botAccountList;

        steem.api.getDynamicGlobalProperties((globalPropsError, result) => {
          if (globalPropsError) {
            this.isLoading = false;
            this.$notify({ title: 'Error' });
            return;
          }
          const totalVestingFundSteem = parseFloat(result.total_vesting_fund_steem.split(' ')[0]);
          const totalVestingShares = parseFloat(result.total_vesting_shares.split(' ')[0]);

          this.calculateSteemPower(totalVestingFundSteem, totalVestingShares);
        });
      });
    }, // loadData
    calculateSteemPower(totalVestingFundSteem, totalVestingShares) {
      let newTableData = [];

      this.tableData.forEach((row) => {
        const vests = parseFloat(row.vesting_shares.split(' ')[0]);
        const delegatedVests = parseFloat(row.delegated_vesting_shares.split(' ')[0]);
        const receivedVests = parseFloat(row.received_vesting_shares.split(' ')[0]);

        const steemPower = totalVestingFundSteem * (vests / totalVestingShares);
        const delegatedSteemPower = totalVestingFundSteem * (delegatedVests / totalVestingShares);
        const receivedSteemPower = totalVestingFundSteem * (receivedVests / totalVestingShares);

        let totalSteemPowerRaw = steemPower + (receivedSteemPower - delegatedSteemPower);
        totalSteemPowerRaw = parseInt(totalSteemPowerRaw);
        const totalSteemPower = this.formatNumber(totalSteemPowerRaw);

        const newRow = Object.assign({}, row, {
          steem_power: steemPower,
          delegated_steem_power: delegatedSteemPower,
          received_steem_power: receivedSteemPower,
          total_steem_power_raw: totalSteemPowerRaw,
          total_steem_power: totalSteemPower,
        });

        newTableData.push(newRow);
      });

      newTableData = newTableData.sort((aItem, bItem) =>
        bItem.total_steem_power_raw - aItem.total_steem_power_raw,
      );

      this.tableData = newTableData;
      this.isLoading = false;
    },

  },
  mounted() {
    this.loadData();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

  .bots{
    text-align: center;
    margin-top: 60px;
  }

  .bots h1{
    font-size: 2.2em;
    font-weight: bold;
  }

  .bots .el-table th:nth-child(2),
  .bots .el-table td:nth-child(2){
    text-align: right;
  }

  .bots .el-table td:nth-child(1){
    text-align: left;
  }

</style>
