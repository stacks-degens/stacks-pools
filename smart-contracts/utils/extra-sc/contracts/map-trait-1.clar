;; (use-trait return-map-1 .map-trait-1.return-map-1)

(define-constant err-invalid (err u300))
(define-constant err-list-length-exceeded (err u101))
(define-constant err-already-asked-to-join (err u102))
(define-constant err-already-joined (err u103))
(define-constant err-not-in-miner-map (err u104))
(define-constant err-no-vote-permission (err u105))
(define-constant err-more-blocks-to-pass (err u106))
(define-constant err-no-pending-miners (err u107))
(define-constant err-already-voted (err u108))
(define-constant err-not-asked-to-join (err u109))
(define-constant err-cant-unwrap-check-miner (err u110))
(define-constant err-cant-unwrap-asked-to-join (err u111))
(define-constant err-cant-unwrap-block-info (err u112))
(define-constant err-unwrap-miner-index (err u999))


(define-map add-lists-principal { address: principal } { values: (list 100 principal)})
(define-map map-is-miner { address: principal } { value: bool})
(define-map map-is-waiting { address: principal } { value: bool})
(define-map map-block-asked-to-join { address: principal } { value: uint})
(define-map map-balance-stx { address: principal } { value: uint})
(define-map map-balance-xBTC { address: principal } { value: uint})
(define-map map-join-request { address: principal } { values: (list 100 principal)})
(define-map map-votes-accept-join { address: principal } { value: uint})
(define-map map-votes-reject-join { address: principal } { value: uint})
(define-map map-block-joined { address: principal } { block-height: uint })
(define-map map-join-request-voter { miner-to-vote: principal, voter: principal } { value: bool})


(define-data-var notifier principal tx-sender)
(define-data-var waiting-list (list 100 principal) (list ))
(define-data-var miners-list (list 100 principal) 
  (list (var-get notifier) 
  'ST4D9ZAT40XFTC1Q9V9HRCHFRB86BTY1EBMVF9BJ 
  'ST2V38Q0PKZRQ32F0NZM1AZV34M53AES0Y6GW8TFT 
  'ST1DMMCGHM69CVFRVG8SYMBWTV0M86AR24BRQVQDH 
  'ST30WKG0J82XTXEW6G8N9T68RZFZ8P9ARKPGFRGRA
  'ST2GESHCMYEPG77M9XY6TET4WY55MENV0Q6T8N3YQ
  'ST1V5TZ5YAVVM03E2D7SMWGYE60KTFWKCJJK6GBYV
  'ST2B94ETDZJ6NVNSSFFAC054RQMQY0MT34SPAP2VX
  'ST1YFV7J4PPH7QRDEAFVWXC2S6MSQ2VDZ9WWV8Y33
  'ST3HFX3M5E6TVDT8GA5X1AB5JKR3JTFXXZM1RKY4H
  'STG1J0D01EFAVJY1FNA0MX7H4CZGKGN13GV2F0VA
  'STQAR0H0D8SC75KWPDXX7X6EBG83J8E72CBFHYC
  'STN7FFYAZPQ47WV9995H00T06MN89CBBY3NMRK68
  'ST1J19EWCXVP4ZSF6PJ2ZV2FW57SZF2W4NV868QDK
  'ST1X6PKZJN6R2HM8J02Y4XTQ3VQ7DS0Z1CKV7RD2B
  'STAW6E55K3VQCH63CG8Q7W0W6ZWHJ17SBJKKM7QA
  'STCXE0WME4WBGHKB2T5A86DT2TE5KNPN0PDVFHWJ
  'STQY11VT7TAGNXM99N9BT5XAY9MF8KZJ53DWFYCG
  'ST3DS71V2QXSFXVGF901EJEG4A3RJKRRRFNJME9HP
  'ST1FRKC5BVD876Q4J8FPXM5YGGSYW7BRP7XTPDHAB))

(define-data-var pending-accept-list (list 100 principal) (list ))
(define-data-var n uint u20)
(define-data-var k-percentage uint u67)
(define-data-var k uint u12 )
(define-data-var k-critical uint u75)
(define-data-var waiting-list-miner-to-remove principal tx-sender) ;; use in remove-principal-miners-list
(define-data-var pending-accept-list-miner-to-remove principal tx-sender)
(define-data-var miners-list-miner-to-remove principal tx-sender)
(define-data-var last-join-done uint u1)
(define-data-var blocks-to-pass uint u100)
(define-data-var miner-to-remove-votes principal tx-sender)

(map-set map-is-miner {address: tx-sender} {value: true})
(map-set map-is-miner {address: 'ST4D9ZAT40XFTC1Q9V9HRCHFRB86BTY1EBMVF9BJ } {value: true})
(map-set map-is-miner {address: 'ST2V38Q0PKZRQ32F0NZM1AZV34M53AES0Y6GW8TFT } {value: true})
(map-set map-is-miner {address: 'ST1DMMCGHM69CVFRVG8SYMBWTV0M86AR24BRQVQDH } {value: true})
(map-set map-is-miner {address: 'ST30WKG0J82XTXEW6G8N9T68RZFZ8P9ARKPGFRGRA } {value: true})
(map-set map-is-miner {address: 'ST2GESHCMYEPG77M9XY6TET4WY55MENV0Q6T8N3YQ } {value: true})
(map-set map-is-miner {address: 'ST1V5TZ5YAVVM03E2D7SMWGYE60KTFWKCJJK6GBYV } {value: true})
(map-set map-is-miner {address: 'ST2B94ETDZJ6NVNSSFFAC054RQMQY0MT34SPAP2VX } {value: true})
(map-set map-is-miner {address: 'ST1YFV7J4PPH7QRDEAFVWXC2S6MSQ2VDZ9WWV8Y33 } {value: true})
(map-set map-is-miner {address: 'ST3HFX3M5E6TVDT8GA5X1AB5JKR3JTFXXZM1RKY4H } {value: true})
(map-set map-is-miner {address: 'STG1J0D01EFAVJY1FNA0MX7H4CZGKGN13GV2F0VA } {value: true})
(map-set map-is-miner {address: 'STQAR0H0D8SC75KWPDXX7X6EBG83J8E72CBFHYC } {value: true})
(map-set map-is-miner {address: 'STN7FFYAZPQ47WV9995H00T06MN89CBBY3NMRK68 } {value: true})
(map-set map-is-miner {address: 'ST1J19EWCXVP4ZSF6PJ2ZV2FW57SZF2W4NV868QDK } {value: true})
(map-set map-is-miner {address: 'ST1X6PKZJN6R2HM8J02Y4XTQ3VQ7DS0Z1CKV7RD2B } {value: true})
(map-set map-is-miner {address: 'STAW6E55K3VQCH63CG8Q7W0W6ZWHJ17SBJKKM7QA } {value: true})
(map-set map-is-miner {address: 'STCXE0WME4WBGHKB2T5A86DT2TE5KNPN0PDVFHWJ } {value: true})
(map-set map-is-miner {address: 'STQY11VT7TAGNXM99N9BT5XAY9MF8KZJ53DWFYCG } {value: true})
(map-set map-is-miner {address: 'ST3DS71V2QXSFXVGF901EJEG4A3RJKRRRFNJME9HP } {value: true})
(map-set map-is-miner {address: 'ST1FRKC5BVD876Q4J8FPXM5YGGSYW7BRP7XTPDHAB } {value: true})

(map-set map-block-asked-to-join {address: tx-sender} {value: u0})
(map-set map-block-asked-to-join {address: 'ST4D9ZAT40XFTC1Q9V9HRCHFRB86BTY1EBMVF9BJ } {value: u0})
(map-set map-block-asked-to-join {address: 'ST2V38Q0PKZRQ32F0NZM1AZV34M53AES0Y6GW8TFT } {value: u0})
(map-set map-block-asked-to-join {address: 'ST1DMMCGHM69CVFRVG8SYMBWTV0M86AR24BRQVQDH } {value: u0})
(map-set map-block-asked-to-join {address: 'ST30WKG0J82XTXEW6G8N9T68RZFZ8P9ARKPGFRGRA } {value: u0})
(map-set map-block-asked-to-join {address: 'ST2GESHCMYEPG77M9XY6TET4WY55MENV0Q6T8N3YQ } {value: u0})
(map-set map-block-asked-to-join {address: 'ST1V5TZ5YAVVM03E2D7SMWGYE60KTFWKCJJK6GBYV } {value: u0})
(map-set map-block-asked-to-join {address: 'ST2B94ETDZJ6NVNSSFFAC054RQMQY0MT34SPAP2VX } {value: u0})
(map-set map-block-asked-to-join {address: 'ST1YFV7J4PPH7QRDEAFVWXC2S6MSQ2VDZ9WWV8Y33 } {value: u0})
(map-set map-block-asked-to-join {address: 'ST3HFX3M5E6TVDT8GA5X1AB5JKR3JTFXXZM1RKY4H } {value: u0})
(map-set map-block-asked-to-join {address: 'STG1J0D01EFAVJY1FNA0MX7H4CZGKGN13GV2F0VA } {value: u0})
(map-set map-block-asked-to-join {address: 'STQAR0H0D8SC75KWPDXX7X6EBG83J8E72CBFHYC } {value: u0})
(map-set map-block-asked-to-join {address: 'STN7FFYAZPQ47WV9995H00T06MN89CBBY3NMRK68 } {value: u0})
(map-set map-block-asked-to-join {address: 'ST1J19EWCXVP4ZSF6PJ2ZV2FW57SZF2W4NV868QDK } {value: u0})
(map-set map-block-asked-to-join {address: 'ST1X6PKZJN6R2HM8J02Y4XTQ3VQ7DS0Z1CKV7RD2B } {value: u0})
(map-set map-block-asked-to-join {address: 'STAW6E55K3VQCH63CG8Q7W0W6ZWHJ17SBJKKM7QA } {value: u0})
(map-set map-block-asked-to-join {address: 'STCXE0WME4WBGHKB2T5A86DT2TE5KNPN0PDVFHWJ } {value: u0})
(map-set map-block-asked-to-join {address: 'STQY11VT7TAGNXM99N9BT5XAY9MF8KZJ53DWFYCG } {value: u0})
(map-set map-block-asked-to-join {address: 'ST3DS71V2QXSFXVGF901EJEG4A3RJKRRRFNJME9HP } {value: u0})
(map-set map-block-asked-to-join {address: 'ST1FRKC5BVD876Q4J8FPXM5YGGSYW7BRP7XTPDHAB } {value: u0})

;; at new join -> block height - last-join-done >= 100 !

;; election functions

(define-private (is-vote-accepted (votes-number uint))
(if 
  (is-eq (var-get k) u0) ;; k is 0 for n=1, n=2 
    (>= votes-number u1) 
    (>= votes-number (var-get k))))

(define-private (is-vote-rejected (votes-number uint))
(if 
  (is-eq (var-get n) u1) 
    (>= votes-number u1) 
    (if (is-eq (var-get n) u2) 
      (>= votes-number u2) 
      (>= votes-number (+ (- (var-get n) (var-get k)) u1)))))

;; joining process

(define-public (ask-to-join (btc-address principal))
(begin 
  (asserts! (not (check-is-miner-now tx-sender)) err-already-joined) ;; assert is true map_is_miner[miner] - done
  (asserts! (not (check-is-waiting-now tx-sender)) err-already-asked-to-join) ;; also keep map for waiting list - done
  (map-set map-block-asked-to-join {address: tx-sender} {value: block-height})
  (var-set waiting-list (unwrap-panic (as-max-len? (concat (var-get waiting-list) (list tx-sender)) u100)))
  (map-set map-is-waiting {address: tx-sender} {value: true})
  (ok true)))

(define-private (accept-miner-in-pool (miner principal)) 
(begin 
  (let ((pending-accept-result (as-max-len? (concat (var-get pending-accept-list) (list miner)) u100))) ;; let (as-max-len? (concat (var-get pending-accept-list) (list miner)) u100)
  (asserts! (is-some pending-accept-result) err-list-length-exceeded) ;; O(1) 
  (var-set miner-to-remove-votes miner)
  (var-set waiting-list (unwrap-panic (as-max-len? (unwrap-panic (remove-principal-waiting-list miner)) u100))) ;; O(N)
  (map-set map-is-waiting {address: miner} {value: false})
  (clear-votes-map miner)
  (ok (var-set pending-accept-list (unwrap-panic pending-accept-result))))))

(define-private (reject-miner-in-pool (miner principal)) 
(begin 
  (let ((remove-result (unwrap-panic (remove-principal-waiting-list miner))))
    (var-set miner-to-remove-votes miner)
    (var-set waiting-list remove-result)
    (map-set map-is-waiting {address: miner} {value: false})
    (clear-votes-map miner)
    true)))

(define-private (clear-votes-map (miner principal)) 
  (map remove-map-record (var-get miners-list)))

(define-private (remove-map-record (miner principal))
(if (is-some (map-get? map-join-request-voter {miner-to-vote: (var-get miner-to-remove-votes), voter: miner})) 
  (map-delete map-join-request-voter {miner-to-vote: (var-get miner-to-remove-votes), voter: miner})
  false))

(define-private (is-in-voters-list (miner principal) (voters-list (list 100 principal))) 
(is-some (index-of voters-list miner)))

(define-private (has-voted (miner principal)) 
(not (if (is-some (get value (map-get? map-join-request-voter {miner-to-vote: miner, voter: tx-sender})))
          (unwrap-panic (get value (map-get? map-join-request-voter {miner-to-vote: miner, voter: tx-sender})))
          false
  )))

(define-public (vote-positive-join-request (miner-to-vote principal))
(begin
  (asserts! (check-is-waiting-now miner-to-vote) err-not-asked-to-join) ;; map_is_waiting
    (asserts! (unwrap! (check-is-miner-when-requested miner-to-vote) err-cant-unwrap-check-miner) err-no-vote-permission)
    (asserts! (has-voted miner-to-vote) err-already-voted) ;; O(1)
    (map-set map-join-request-voter 
      {miner-to-vote: miner-to-vote, voter: tx-sender} 
      {value: true})
    (if (is-some (get value (map-get? map-votes-accept-join {address: miner-to-vote}))) 
      (map-set map-votes-accept-join {address: miner-to-vote} {value: (+ (unwrap-panic (get value (map-get? map-votes-accept-join {address: miner-to-vote}))) u1)})
      (map-set map-votes-accept-join {address: miner-to-vote} {value: u1}))
    ;; READ-ONLY WHICH DISPLAYS IF YOU CAN JOIN
    ;; you can call another function which only does this
    (try! 
      (if (is-vote-accepted (unwrap-panic (get value (map-get? map-votes-accept-join {address: miner-to-vote}))))
        (accept-miner-in-pool miner-to-vote) 
        (ok false))) 
    (ok true)))

(define-public (vote-negative-join-request (miner-to-vote principal))
(begin
  (asserts! (check-is-waiting-now miner-to-vote) err-not-asked-to-join)
    (asserts! (unwrap! (check-is-miner-when-requested miner-to-vote) err-cant-unwrap-check-miner) err-no-vote-permission)
    (asserts! (has-voted miner-to-vote) err-already-voted)    
    (map-set map-join-request-voter 
      {miner-to-vote: miner-to-vote, voter: tx-sender} 
      {value: true})
    (if (is-some (get value (map-get? map-votes-reject-join {address: miner-to-vote}))) 
      (map-set map-votes-reject-join {address: miner-to-vote} {value: (+ (unwrap-panic (get value (map-get? map-votes-reject-join {address: miner-to-vote}))) u1)})
      (map-set map-votes-reject-join {address: miner-to-vote} {value: u1}))  
    (some
      (if (is-vote-rejected (unwrap-panic (get value (map-get? map-votes-reject-join {address: miner-to-vote}))))
        (reject-miner-in-pool miner-to-vote) 
        false))
    (ok true)))

(define-public (enter-pool) ;; to replace the previous version from vote-positive
(if (check-vote-accepted)
  (accept-miner-in-pool tx-sender) 
  (ok false)))

(define-read-only (check-vote-accepted) ;; to replace the previous version from vote-positive
  (is-vote-accepted (unwrap-panic (get value (map-get? map-votes-accept-join {address: tx-sender})))))

(define-public (add-pending-miners-to-pool) 
(begin
  (let ((len-pending-accept-list (len (var-get pending-accept-list))))
    (asserts! (not (is-eq len-pending-accept-list u0)) err-no-pending-miners)
    (asserts! (x-blocks-passed (var-get blocks-to-pass)) err-more-blocks-to-pass)
    (map add-miner-to-pool (var-get pending-accept-list))
    (asserts! (is-some (as-max-len? (concat (var-get miners-list) (var-get pending-accept-list)) u100)) err-list-length-exceeded) ;; let (as-max-len? (concat (var-get miners-list) (var-get pending-accept-list)) u100) 
    (var-set miners-list (unwrap-panic (as-max-len? (concat (var-get miners-list) (var-get pending-accept-list)) u100))) ;; to keep
    (var-set n (+ (var-get n) len-pending-accept-list))
    (var-set pending-accept-list (list ))
    (var-set last-join-done block-height)
    (some (update-threshold))
    (ok true))))

(define-private (update-threshold) 
(var-set k (/ (* (var-get k-percentage) (- (var-get n) u1)) u100)))

(define-public (add-miner-to-pool (miner principal))
(begin 
    (map-set map-is-miner {address: miner} {value: true})
    (map-set map-block-joined {address: miner} {block-height: block-height})
    (ok true)))

(define-private (x-blocks-passed (x uint)) 
(if (>= (- block-height (var-get last-join-done)) x)
  true
  false))

;; leave pool process

(define-public (leave-pool)
(begin 
  (asserts! (check-is-miner-now tx-sender) err-not-in-miner-map)
  (let ((remove-result (unwrap-panic (remove-principal-miners-list tx-sender)))
        (new-k-percentage (/ (* (var-get k) u100) (- (var-get n) u2))))
    (some (var-set miners-list remove-result))
    (var-set n (- (var-get n) u1))
    (map-set map-is-miner {address: tx-sender} {value: false})
    (if (>= new-k-percentage (var-get k-critical)) 
      (some (update-threshold))
      none)
    (ok true))))

;; list processing functions

(define-public (remove-principal-waiting-list (miner principal))
(begin
    (var-set waiting-list-miner-to-remove miner) 
    (ok (filter is-principal-in-waiting-list (var-get waiting-list))))) ;; O(N)

(define-public (remove-principal-pending-accept-list (miner principal))
(begin 
    (var-set waiting-list-miner-to-remove miner) 
    (ok (filter is-principal-in-pending-accept-list (var-get pending-accept-list)))))

(define-public (remove-principal-miners-list (miner principal))
(begin
  (var-set waiting-list-miner-to-remove miner) 
  (ok (filter is-principal-in-miners-list (var-get miners-list))))) ;; O(N)

(define-public (append-to-list (list-to-append (list 100 principal)) (miner principal))
(begin 
  (let ((list-length-after-append (+ (len list-to-append) u1)))
    (ok (append list-to-append miner))))) 

;; check miner status

(define-public (check-is-miner-when-requested (miner-to-vote-address principal))
(ok (if 
  (is-some 
    (at-block (unwrap! (get-block-info? id-header-hash 
      (unwrap! (get value (map-get? map-block-asked-to-join {address: miner-to-vote-address})) err-cant-unwrap-asked-to-join)) err-cant-unwrap-block-info) 
        (get value (map-get? map-is-miner {address: tx-sender}))))
  (at-block 
    (unwrap! 
      (get-block-info? id-header-hash 
        (unwrap-panic 
          (get value 
            (map-get? map-block-asked-to-join {address: miner-to-vote-address}))))
            (err u789))
            (unwrap-panic (get value (map-get? map-is-miner {address: tx-sender}))))
  false)))

(define-read-only (check-is-miner-when-requested-tool-fn (miner-to-vote-address principal)) 
(get value (map-get? map-is-miner {address: tx-sender})))

(define-private (check-is-miner-now (miner principal))
(if (is-some (get value (map-get? map-is-miner {address: miner})))
  (unwrap-panic (get value (map-get? map-is-miner {address: tx-sender})))
  false))

(define-private (check-is-waiting-now (miner principal))
(if (is-some (get value (map-get? map-is-waiting {address: miner})))
  (unwrap-panic (get value (map-get? map-is-waiting {address: miner})))
  false))

;; read-only utils

(define-read-only (get-principals-list (address principal)) 
(map-get? add-lists-principal {address: tx-sender}))

(define-read-only (get-k) 
(var-get k))

(define-read-only (get-waiting-list) 
(var-get waiting-list))

(define-read-only (get-miners-list) 
(var-get miners-list))

(define-read-only (get-pending-accept-list) 
(var-get pending-accept-list ))

(define-read-only (get-map-join-req) 
(map-get? map-join-request {address: tx-sender}))

(define-private (is-principal-in-waiting-list (miner principal))
(not (is-eq 
  (var-get waiting-list-miner-to-remove)
  miner)))

(define-private (is-principal-in-pending-accept-list (miner principal))
(not (is-eq 
  (var-get pending-accept-list-miner-to-remove)
  miner)))

(define-private (is-principal-in-miners-list (miner principal))
(not (is-eq  
  (var-get miners-list-miner-to-remove) 
  miner)))
;; modified from index to miner address