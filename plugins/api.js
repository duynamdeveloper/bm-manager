export const api = $axios => () => ({
  getBM: function (bm_id, token, ad_account_type) {
    let fields = [
      "id",
      "name",
      "account_id",
      "account_status",
      "business",
      "currency",
      "timezone_name",
      "end_advertiser",
      "end_advertiser_name",
      "invoicing_emails",
      "funding_source",
      "onbehalf_requests.fields(receiving_business.fields(name),status)"
    ];

    let params = {
      _reqName: `object:business/${ad_account_type}`,
      access_token: token,
      __bussiness_id: bm_id,
      _reqSrc: "BusinessConnectedOwnedAdAccountsStore.brands",
      _sessionID: "2b24b38c0e92085c",
      date_format: "U",
      fields: JSON.stringify(fields),

      method: "get",
      pretty: "0",
      suppress_http_code: 1
    };
    return $axios.get(
      `https://graph.facebook.com/v3.2/${bm_id}/${ad_account_type}`,
      {
        params: params
      }
    );
  },
  getPaymentInfo(bm_id, token, account_id) {
    let fields = [
      "active_billing_date_preference{day_of_month,id,next_bill_date,time_created,time_effective}",
      "can_pay_now",
      "can_repay_now",
      "current_unbilled_spend",
      "extended_credit_info",
      "extended_credit_status",
      "is_br_entity_account",
      "has_extended_credit",
      "max_billing_threshold",
      "min_billing_threshold",
      "min_payment",
      "next_bill_date",
      "pending_billing_date_preference{day_of_month,id,next_bill_date,time_created,time_effective}",
      "promotion_progress_bar_info",
      "show_improved_boleto",
      "business{id,name,payment_account_id}",
      "total_prepay_balance",
      "is_in_middle_of_local_entity_migration",
      "is_in_3ds_authorization_enabled_market",
      "current_unpaid_unrepaid_invoice",
      "has_repay_processing_invoices"
    ];
    let params = {
      _reqName: "adaccount",
      access_token: token,
      __bussiness_id: bm_id,
      _reqSrc: "AdsCMPaymentsAccountDataDispatcher",
      _sessionID: "2b24b38c0e92085c",
      fields: JSON.stringify(fields),
      include_headers: false,
      locale: "vi_VN",
      method: "get",
      pretty: "0",
      suppress_http_code: 1
    };
    return $axios.get(`https://graph.facebook.com/v3.2/act_${account_id}`, {
      params: params
      // paramsSerializer: function(params) {
      //   return qs.stringify(params, { arrayFormat: 'brackets' })
      // }
    });
  },
  getThresholdAmount(bm_id, token, account_id) {
    let params = {
      _reqName: "adaccount/adspaymentcycle",
      access_token: token,
      __bussiness_id: bm_id,
      _reqSrc: "AdsCMPaymentsAccountDataDispatcher",
      _sessionID: "2b24b38c0e92085c",
      include_headers: false,
      locale: "vi_VN",
      method: "get",
      pretty: "0",
      suppress_http_code: 1
    };
    return $axios.get(
      `https://graph.facebook.com/v3.2/act_${account_id}/adspaymentcycle`,
      {
        params: params
      }
    );
  }
});
export default (ctx, inject) => {
  const apiWithAxios = api(ctx.$axios);
  inject("fbApi", apiWithAxios());
};
