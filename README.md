# Forex Check

A responsive currency converter with searchable currency selection, exchange-rate history, market ticker, comparisons, favorites, and a conversion log.

## Run locally

```sh
npm install
npm run dev
```

## Data

Currency and exchange-rate data is loaded from the [Frankfurter API](https://www.frankfurter.app/). Rates are reference rates and are updated by the provider on business days. An internet connection is required to load currency and rate data.

Favorites and the conversion log are kept in the current page session.
