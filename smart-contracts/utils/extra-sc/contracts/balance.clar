
;; title: balance
;; version:
;; summary:
;; description:
;; deposit and withdraw STX from the SC 
;; balance for each miner is stored in a map
;; use fixed 6 point arithmetic to store balance
;; 1 STX = 1000000
;; traits
;;

;; token definitions
;; 

;; constants
;;
(define-constant err-insufficient-balance (err u1001))
(define-constant err-missing-balance (err u1002))
(define-constant err-already-distributed (err u1003))
(define-constant err-cant-unwrap-rewarded-block (err u1004))

(define-constant ONE u1000000)
(define-constant reward u1000000000)
(define-map balance principal uint)
(define-map claimed-rewards { block-number: uint } { claimed: bool })

(define-data-var miners-list (list 100 principal) (list tx-sender))
(define-data-var miners-list-len-at-reward-block uint u0)
(map-set balance tx-sender u0)

;; read balance
(define-read-only (get-balance (address principal)) 
(map-get? balance address))

;; deposit funds
(define-public (deposit-stx (amount uint))
(let ((sender tx-sender)
      (balance-sender (map-get? balance sender)))
  (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
  (if (is-none balance-sender) 
    (ok (map-set balance sender amount))
    (ok (map-set balance sender (+ (unwrap! balance-sender err-missing-balance) amount))))))

;; withdraw funds
(define-public (withdraw-stx (amount uint)) 
(let ((receiver tx-sender)) 
  (asserts! (>= (unwrap! (map-get? balance receiver) err-missing-balance) amount) err-insufficient-balance)
  (try! (as-contract (stx-transfer? amount (as-contract tx-sender) receiver)))
  (ok (map-set balance receiver (- (unwrap! (map-get? balance receiver) err-missing-balance) amount)))))

(define-public (reward-distribution (block-number uint))
(begin 
  (asserts! (is-none (get claimed (map-get? claimed-rewards {block-number: block-number}))) err-already-distributed)
  (let ((miners-list-at-reward-block (at-block (unwrap! (get-block-info? id-header-hash block-number) err-cant-unwrap-rewarded-block) (var-get miners-list))))
  (map-set claimed-rewards {block-number: block-number} {claimed: true})
  (var-set miners-list-len-at-reward-block (len miners-list-at-reward-block)) 
  (print (var-get miners-list-len-at-reward-block))
  (map distribute-reward-each-miner miners-list-at-reward-block)
  (ok true))))

(define-private (distribute-reward-each-miner (miner principal)) 
(map-set balance miner (+ (unwrap-panic (map-get? balance miner)) (/ reward (var-get miners-list-len-at-reward-block)))))