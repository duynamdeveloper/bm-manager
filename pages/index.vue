<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card class="pa-2">
        <v-layout row>
          <v-flex xs3 class="pr-2">
            <v-text-field outline label="BM ID" v-model="business.id"></v-text-field>
          </v-flex>
          <v-flex xs3>
            <v-text-field outline label="Token" v-model="business.token"></v-text-field>
          </v-flex>
          <v-flex xs2>
            <v-btn @click="fetchData" color="primary" depressed large>LOAD</v-btn>
            <v-btn @click="exportCsv" color="primary" depressed large>Export</v-btn>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs3 class="pa-2">
            <v-card color="blue-grey darken-2" class="white--text">
              <v-card-title primary-title>
                <div>
                  <div class="headline">{{ accounts.length }}</div>
                  <span>Numbers of accounts</span>
                </div>
              </v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs3 class="pa-2">
            <v-card color="yellow darken-2" class="white--text">
              <v-card-title primary-title>
                <div>
                  <div class="headline">{{ Math.round(totalSpend * 100) / 100 }}</div>
                  <span>Total Spend (Unbilled)</span>
                </div>
              </v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs3 class="pa-2">
            <v-card color="success darken-2" class="white--text">
              <v-card-title primary-title>
                <div>
                  <div class="headline">{{ numberOfActiveAccount }}</div>
                  <span>Number of active accounts</span>
                </div>
              </v-card-title>
            </v-card>
          </v-flex>
          <v-flex xs3 class="pa-2">
            <v-card color="red darken-2" class="white--text">
              <v-card-title primary-title>
                <div>
                  <div class="headline">{{ numberOfInactiveAccount }}</div>
                  <span>Number of inactive accounts</span>
                </div>
              </v-card-title>
            </v-card>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
    <v-flex xs12 pt-2>
      <v-card>
        <v-card-title>
          Ads Accounts
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="accounts"
          :loading="tableLoading"
          :search="search"
          class="elevation-1"
          :pagination.sync="pagination"
        >
          <v-progress-linear v-slot:progress color="blue" indeterminate></v-progress-linear>
          <template v-slot:items="props">
            <td>{{ props.item.account_id }}</td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.business.name }}</td>
            <td>
              <v-chip
                :color="props.item.account_status == 1 ? 'green darken-1' : 'red darken-1'"
                class="white--text"
              >
                <v-avatar>
                  <v-icon v-if="props.item.account_status == 1">check_circle</v-icon>
                  <v-icon v-else>remove_circle</v-icon>
                </v-avatar>
                {{ props.item.account_status == 1 ? 'active' : 'inactive' }}
              </v-chip>
            </td>
            <td>{{ props.item.currency }}</td>
            <td>{{ props.item.timezone_name }}</td>
            <td
              v-if="props.item.hasOwnProperty('threshold')"
              :class="props.item.threshold == 'unavailable' ? 'red--text' : 'text-xs-black'"
            >{{ props.item.threshold}}</td>
            <td v-else>
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </td>
            <td
              v-if="props.item.hasOwnProperty('unbilled')"
              :class="props.item.unbilled == 'unavailable' ? 'red--text' : 'text-xs-black'"
            >{{ props.item.unbilled}}</td>
            <td v-else>
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </td>
            <td
              v-if="props.item.hasOwnProperty('unpaid')"
              :class="props.item.unpaid == 'unavailable' ? 'red--text' : ''"
            >{{ props.item.unpaid}}</td>
            <td v-else>
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </td>
          </template>
          <template v-slot:no-results>
            <v-alert
              :value="true"
              color="error"
              icon="warning"
            >Your search for "{{ search }}" found no results.</v-alert>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import api from '~/plugins/api'
export default {
  components: {},
  data() {
    return {
      search: '',
      tableLoading: false,
      business: {
        id: '',
        token: '',
        name: 'Business Name'
      },
      pagination: {
        descending: true,
        page: 1,
        rowsPerPage: 25, // -1 for All",
        sortBy: 'name',
        totalItems: 0
      },
      headers: [
        { text: 'Account Id', value: 'account_id' },
        { text: 'Name', value: 'name' },
        { text: 'BM', value: 'business' },
        { text: 'Status', value: 'account_status' },
        { text: 'Currency', value: 'currency' },
        { text: 'Timezone', value: 'timezone_name' },
        { text: 'Billing Threshold', value: 'threshold' },
        { text: 'Current Unbilled', value: 'unbilled' },
        { text: 'Account Balance', value: 'unpaid' }
      ],
      owned_ad_accounts: [],
      client_ad_accounts: []
    }
  },
  methods: {
    async fetchData() {
      this.tableLoading = true
      this.owned_ad_accounts = []
      this.client_ad_accounts = []
      let owned_ad_accounts_response = await this.$fbApi.getBM(
        this.business.id,
        this.business.token,
        'owned_ad_accounts'
      )

      if (
        owned_ad_accounts_response.data.hasOwnProperty('data') &&
        owned_ad_accounts_response.data.data.length > 0
      ) {
        this.owned_ad_accounts = owned_ad_accounts_response.data.data
        if (owned_ad_accounts_response.data.paging.next) {
          await this.continueLoading(
            owned_ad_accounts_response.data.paging.next,
            'owned_ad_accounts'
          )
        }
      }

      let client_ad_accounts_response = await this.$fbApi.getBM(
        this.business.id,
        this.business.token,
        'client_ad_accounts'
      )
      //console.log(client_ad_accounts_response);
      if (
        client_ad_accounts_response.data.hasOwnProperty('data') &&
        client_ad_accounts_response.data.data.length > 0
      ) {
        this.client_ad_accounts = client_ad_accounts_response.data.data
        if (client_ad_accounts_response.data.paging.next) {
          await this.continueLoading(
            client_ad_accounts_response.data.paging.next,
            'client_ad_accounts'
          )
        }
      }
      this.tableLoading = false
      await this.loadInfomation()
      this.pagination.totalItems = this.accounts.length
    },
    async continueLoading(url, ad_account_type) {
      let res = await this.$axios.get(url)
      // console.log(this[ad_account_type])
      this[ad_account_type] = this[ad_account_type].concat(res.data.data)
      if (res.data.paging.next) {
        await this.continueLoading(res.data.paging.next, ad_account_type)
      }
    },
    loadInfomation() {
      this.tableLoading = true
      Promise.all(
        this.accounts.map((account, index, arr) => {
          this.$fbApi
            .getThresholdAmount(
              this.business.id,
              this.business.token,
              account.account_id
            )
            .then(res => {
              if (res.data.data.length > 0) {
                let amount = res.data.data[0].threshold_amount.toString()
                amount = amount.substring(0, amount.length - 2)
                // console.log(res.data.data[0].threshold_amount)
                this.$set(
                  this.accounts[index],
                  'threshold',
                  this.convertToFloat(amount)
                )
              } else {
                this.$set(this.accounts[index], 'threshold', 'unavailable')
              }
            })
            .catch(error => {
              console.log(error)
            })
          this.$fbApi
            .getPaymentInfo(
              this.business.id,
              this.business.token,
              account.account_id
            )
            .then(res => {
              if (Object.keys(res.data).length > 0) {
                this.$set(
                  this.accounts[index],
                  'unbilled',
                  this.convertToFloat(res.data.current_unbilled_spend.amount)
                )
                this.$set(
                  this.accounts[index],
                  'unpaid',
                  this.convertToFloat(
                    res.data.current_unpaid_unrepaid_invoice.amount
                  )
                )
              } else {
                this.$set(this.accounts[index], 'unbilled', 'unavailable')
                this.$set(this.accounts[index], 'unpaid', 'unavailable')
              }
              //console.log(res)
            })
        })
      ).then(res => {
        this.tableLoading = false
      })
    },
    exportCsv() {
      const escape = text =>
        text
          .replace(/\\/g, '\\\\')
          .replace(/\n/g, '\\n')
          .replace(/,/g, '\\,')
      let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      let rows = []

      let headers = [
        'account id',
        'name',
        'status',
        'currency',
        'timezone_name',
        'limit',
        'unbilled',
        'unpaid'
      ]
      rows.push(headers)
      this.accounts.map(account => {
        let account_status = 1
        account.account_status == 1
          ? (account_status = 'active')
          : (account_status = 'inactive')
        //console.log(account.unbilled);
        rows.push([
          `"${account.account_id}"`,
          account.name,
          account_status,
          account.currency,
          account.timezone_name,
          `"${account.threshold}"`,
          `"${account.unbilled}"`,
          `"${account.unpaid}"`
        ])
      })

      rows.forEach(function(rowArray) {
        let row = rowArray.join(',')
        csvContent += row + '\r\n'
      })
      var encodedUri = encodeURI(csvContent)
      var link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', 'my_data.csv')
      document.body.appendChild(link) // Required for FF

      link.click()
    },
    convertToFloat(string) {
      if (string.includes(',')) {
        string = string.replace('.', '').replace(',', '.')
      }
      return parseFloat(string)
    }
  },
  computed: {
    accounts: function() {
      return this.owned_ad_accounts.concat(this.client_ad_accounts)
    },
    totalSpend: function() {
      let total = 0
      this.accounts.map(acc => {
        if (acc.unbilled !== undefined) {
          if (!isNaN(acc.unbilled)) {
            total += acc.unbilled
          }
        }
      })
      return total
    },
    numberOfActiveAccount: function() {
      return this.accounts.filter(acc => acc.account_status == 1).length
    },
    numberOfInactiveAccount: function() {
      return this.accounts.filter(acc => acc.account_status != 1).length
    }
  }
}
</script>
