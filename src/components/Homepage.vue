<template>
  <div class="content-wrapper">

    <div class="sorters-wrapper">
      <h3>Sort by</h3>

      <div class="sorters">
        <div
          @click="changeSorter('pending_payout_value')"
          :class="['sorter__link', {'active': isActiveSorter('pending_payout_value')}]"> 
            Pending payout
        </div>

        <div
          @click="changeSorter('children')"
          :class="['sorter__link', {'active': isActiveSorter('children')}]">
            Comments
        </div>
        <div
          @click="changeSorter('net_votes')"
          :class="['sorter__link', {'active': isActiveSorter('net_votes')}]">
            Upvotes
        </div>
      </div>
    </div>

    <div class="content">

      <div class="card top-categories">
        <h1>Top categories</h1>
        <div class="center-align">

          <div 
            class="chip"
            v-for="item in topCategories"
            v-bind:key="item.category"> 
              {{item.category}}
          </div>

          <span v-if="topCategories.length == 0"> Loading... </span>
        </div>
      </div>

      <h1>Top authors</h1>

      <div
        class="collection author-list"
        v-infinite-scroll="loadData"
        infinite-scroll-disabled="isLoading"
        infinite-scroll-distance="10">
        
        <author-item
          v-for="(item, index) in authors"  
          v-bind:key="item.author"
          :author='item.author'
          :pending_payout_value='item.pending_payout_value'
          :net_votes='item.net_votes'
          :children='item.children'
          :sbd_balance='item.sbd_balance'
          :steem_balance='item.steem_balance'
          :profile__position='index + 1'
        >
        </author-item>

      </div>

      <div id="loader" class="center-align" v-if="isLoading">
        <div class="preloader-wrapper big active">
          <div class="spinner-layer spinner-blue-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div><div class="gap-patch">
              <div class="circle"></div>
            </div><div class="circle-clipper right">
              <div class="circle"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  
  </div>
</template>

<script>

import authorItem from './AuthorItem';

export default {
  name: 'Homepage',
  components: {
    'author-item': authorItem,
  },
  data() {
    return {
      isLoading: false,
      activeSorter: 'pending_payout_value',
      lastProfileValue: 999999,
      authors: [],
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
    loadData() {
      this.isLoading = true;

      const sqlQueryBase = `
        SELECT TOP 50
          Comments.author,
          SUM(Comments.pending_payout_value) as pending_payout_value,
          COUNT(*) as posts,
          SUM(Comments.children) as children,
          SUM(Comments.net_votes) as net_votes,
          Accounts.sbd_balance,
          Accounts.balance  as steem_balance,
          Accounts.created
        FROM
          Comments
          INNER JOIN Accounts ON Comments.author = Accounts.name
        WHERE
          Comments.depth=0 AND
          Comments.created BETWEEN GETDATE()-7 AND GETDATE()
        GROUP BY Comments.author, Accounts.sbd_balance, Accounts.balance, Accounts.created
        HAVING SUM(Comments.{sorter}) < {lastProfileValue}
        ORDER BY SUM(Comments.{sorter}) DESC
      `;

      let sqlQuery = sqlQueryBase.replace('{lastProfileValue}', this.lastProfileValue);
      sqlQuery = sqlQuery.replace(/{sorter}/g, this.activeSorter);

      const ajaxData = {
        query: sqlQuery,
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
            // return Promise.reject(new Error(response.statusText));
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            return;
          }
          this.authors = this.authors.concat(data.rows);
          // var itemHtml = itemHtml.replace('{created}', row['created']);
          this.lastProfileValue = data.rows[data.rows.length - 1][this.activeSorter];

          this.isLoading = false;
        })
        .catch((error) => {
          console.log('Request failed', error);
          // Materialize.toast('Error!', 4000);
        });
    }, // loadData
    loadTopCategories() {
      const sqlTopCategories = `
        SELECT TOP 5 category, SUM(Comments.pending_payout_value) as sum_pending_payout_value
        FROM Comments
        WHERE depth=0 AND created BETWEEN GETDATE()-7 AND GETDATE()
        GROUP BY category
        ORDER BY sum_pending_payout_value DESC
      `;

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
  },
  mounted() {
    this.loadData();
    this.loadTopCategories();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.content-wrapper{
    max-width: 1200px;
    margin: auto;
    margin-top: 100px;
    padding: 0 20px;
    position: relative;
}

/*
.content-wrapper{
    max-width: 1000px;
    margin: auto;
    margin-top: 100px;
    padding: 0 20px;
}
*/

.content{
    max-width: 900px;
    margin: auto;
    text-align: center;
}

.content h1{
    font-size: 20px;
    text-align: center;
}

.content > .card{
    margin: 0;
    padding: 10px 20px;
    display: inline-block;
}
.content > .card > h1{
    margin: 0;
    margin-bottom: 10px;
}

.collection.author-list{
    text-align: left;
}

.profile-link{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 2;
}

.profile__top-post{
  z-index: 3;
}
.profile__top-post a{
  z-index: 3;
  position: absolute;
    margin-left: 4px;
}

.profile__top-post a:hover{
  text-decoration: underline;
}

.collection.author-list a.profile{
    color: rgba(0,0,0,0.87);
}

.collection.author-list .collection-item:hover {
    background-color: #ddd;
    background-color: #eee;
}

.profile i{
  color: rgba(0,0,0,0.6);
}

.profile__data__main > span:not(:last-child):after {
    content: '|';
    margin: 0 7px;
}

.profile__comments i{
    margin-right: 5px;
}

.profile__data__main i{
    font-size: 17px;
    vertical-align: text-top;
}

.profile__position{
    font-size: 20px;
    font-weight: 600;
}

.sorters-wrapper{
    font-family: Space Mono,monospace;
    position: absolute;
    left: 0;
}

.sorters-wrapper h3{
  font-size: 18px;
  margin-bottom: 13px;
}

.sorters{
    border-left: 1px solid #ccc;
    padding-left: 10px;
    display: inline-block;
}

.sorters .sorter__link{
  position: relative;
  display: block;
  opacity: 0.4;
  color: #000;
    z-index: 2;

    transition: 0.1s;
}

.sorters .sorter__link:not(:first-child){
  margin-top: 10px;
}

.sorters .sorter__link:hover{
  cursor: pointer;
  opacity: 1;
}

.sorters .sorter__link.active{
  opacity: 1;
}

.sorters .active:before{
  content: '';
    display: inline-block;
    width: 2px;
    height: 20px;
    background-color: #000;
    left: -12px;
    position: absolute;
}

@media(max-width: 1270px){
  .sorters-wrapper{
    margin-bottom: 30px;
      text-align: center;
  }

  .sorters{
    border: none;
  }

  .sorters .active:before{
    display: none;
  }
}

</style>
