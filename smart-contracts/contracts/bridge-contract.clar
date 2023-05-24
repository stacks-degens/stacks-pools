;; exhchange utilities
(use-trait ft-trait .trait-sip-010.sip-010-trait)

(define-constant ONE_8 u100000000)

(define-private (to-one-8 (a uint))
  (* a ONE_8))

(define-private (mul-down (a uint) (b uint))
  (/ (* a b) ONE_8))

(define-private (div-down (a uint) (b uint))
  (if (is-eq a u0)
    u0
    (/ (* a ONE_8) b)))

(define-private (minus-percent (a uint) (percent uint))
  (if (is-eq a u0)
    u0
    (/ (- (* a u100) (* a percent)) u100)))

;; public to check return btc-to-stx amount
;; input: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wbtc 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wstx 5000
(define-public (swap-xbtc-to-stx (token-x-trait <ft-trait>) (token-y-trait <ft-trait>) (sats-amount uint) (slippeage uint)) 
  (let (
    ;; (btc-formatted-amount (to-one-8 sats-amount))
    (token-x (contract-of token-x-trait))
    (token-y (contract-of token-y-trait))
    (fee-amount 
      (contract-call? .amm-swap-pool-v1-1 fee-helper token-x token-y ONE_8))
    (stx-amount 
      (mul-down 
        (unwrap-panic (contract-call? .amm-swap-pool-v1-1 get-helper token-x token-y ONE_8 sats-amount)) 
        (- ONE_8 (unwrap-panic fee-amount))))
    (stx-amount-slippeage (minus-percent stx-amount slippeage)))
    (try! (contract-call? 
        .amm-swap-pool-v1-1 swap-helper
          token-x-trait
          token-y-trait
          ONE_8
          sats-amount
        (some stx-amount-slippeage)))
    (ok stx-amount)))

;; (define-public (swap-stx-to-xbtc (token-x-trait <ft-trait>) (token-y-trait <ft-trait>) (stx-amount uint) (slippeage uint)) 
;;   (let (
;;     (stx-formatted-amount (to-one-8 stx-amount))
;;     (token-x (contract-of token-x-trait))
;;     (token-y (contract-of token-y-trait))
;;     (fee-amount 
;;       (contract-call? 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03 fee-helper token-x token-y))
;;     (xbtc-amount 
;;       (mul-down 
;;         (unwrap-panic (contract-call? 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03 get-helper token-x token-y stx-formatted-amount)) 
;;         (- ONE_8 (unwrap-panic fee-amount))))
;;     (xbtc-amount-slippeage (minus-percent xbtc-amount slippeage)))
;;     (try! (contract-call? 
;;         'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.swap-helper-v1-03 
;;         swap-helper
;;         token-x-trait
;;         token-y-trait
;;         stx-formatted-amount
;;         (some xbtc-amount-slippeage)))
;;     (ok true)))

;; error 2001 - inexistent pool
;; works when deployed on mainnet
(define-public (swap-get (token-x-trait <ft-trait>) (token-y-trait <ft-trait>) (sats-amount uint))
  (let (
    ;; (btc-formatted-amount (to-one-8 sats-amount))
    (token-x (contract-of token-x-trait))
    (token-y (contract-of token-y-trait)))
  (contract-call? .amm-swap-pool-v1-1 get-helper token-x token-y ONE_8 sats-amount)))
