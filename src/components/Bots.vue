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

import steem from 'steem';

export default {
  name: 'Bots',
  components: {
  },
  data() {
    return {
      isLoading: false,
      tableData: [],
    };
  },
  methods: {
    loadData() {
      this.isLoading = true;

      const botList = `(
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
          'minnowhelper'
        )
      `;

      const sqlBots = `
        SELECT
          name,
          vesting_shares,
          delegated_vesting_shares,
          received_vesting_shares
        FROM Accounts
        WHERE name IN ${botList}
      `;

      // json_metadata, voting_power, reputation
      // vesting_shares, delegated_vesting_shares , received_vesting_shares

      const ajaxData = {
        query: sqlBots,
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
          this.tableData = data.rows;

          steem.api.setOptions({ url: 'https://api.steemit.com' });
          steem.api.getDynamicGlobalProperties((err, result) => {
            const totalVestingFundSteem = parseFloat(result.total_vesting_fund_steem.split(' ')[0]);
            const totalVestingShares = parseFloat(result.total_vesting_shares.split(' ')[0]);

            this.calculateSteemPower(totalVestingFundSteem, totalVestingShares);
            console.log(err, result);
          });
        })
        .catch((error) => {
          this.isLoading = false;
          console.log('Request failed', error);
        });
    }, // loadData
    formatter(valueInt) {
      let valueStr = valueInt.toString();
      if (valueStr.length > 6) {
        valueStr = `${Number((valueInt / 1000000).toFixed(2))}M`;
      } else if (valueStr.length > 3) {
        valueStr = `${(valueInt / 1000).toFixed()}k`;
      }
      return valueStr;
    },
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
        const totalSteemPower = this.formatter(totalSteemPowerRaw);

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
