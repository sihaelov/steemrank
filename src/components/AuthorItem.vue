<template>

  <div class="collection-item avatar profile">
    <a :href="`https://steemit.com/@${author}`" target="_blank" class="profile-link"></a>
    <img :src="`https://steemitimages.com/u/${author}/avatar`" class="circle">
    <span class="title">@{{author}}</span>
    <div class="profile__data">
      <p class="profile__data__main">
        <span title="Pending payout"><i class="material-icons">monetization_on</i> {{pending_payout_value}}</span>
        <span title="Number of upvotes"><i class="material-icons">thumb_up</i> {{net_votes}}</span>
        <span title="Number of comments" class="profile__comments"><i class="fa fa-comments"></i>{{children}}</span>
      </p>
      <p>Balance: {{sbd_balance}} | {{steem_balance}}</p>
    </div>
    <p class="secondary-content profile__position">{{profile__position}}</p>
  </div>

</template>

<script>
export default {
  name: 'authorItem',
  props: [
    'author',
    'pending_payout_value',
    'net_votes',
    'children',
    'sbd_balance',
    'steem_balance',
    'profile__position',
  ],
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
