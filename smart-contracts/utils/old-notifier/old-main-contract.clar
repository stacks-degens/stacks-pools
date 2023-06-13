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
(define-constant err-currently-notifier (err u113))
(define-constant err-not-in-miner-map-miner-to-remove (err u114))
(define-constant err-already-proposed-for-removal (err u116))
(define-constant err-not-proposed-for-removal (err u117))
(define-constant err-cant-remove-when-alone-in-pool (err u118))
(define-constant err-cant-vote-himself (err u119))
(define-constant err-cant-change-notifier (err u120))
(define-constant err-already-proposed-for-notifier (err u121))
(define-constant err-not-proposed-for-removal-k-missing (err u122))
(define-constant err-not-proposed-for-notifier-k-missing (err u123))
(define-constant err-not-proposed-notifier (err u124))
(define-constant err-already-notifier (err u125))
(define-constant err-unwrap-miner-index (err u999))
(define-constant err-not-in-miner-map-proposed-notifier (err u126))

(define-map add-lists-principal { address: principal } { values: (list 100 principal)})
(define-map map-is-miner { address: principal } { value: bool})
(define-map map-is-waiting { address: principal } { value: bool})
(define-map map-is-proposed-for-removal { address: principal } { value: bool})
(define-map map-is-proposed-for-notifier { address: principal } { value: bool})
(define-map map-block-asked-to-join { address: principal } { value: uint})
(define-map map-block-proposed-to-remove { address: principal } { value: uint})
(define-map map-block-proposed-notifier { address: principal } { value: uint})
(define-map map-block-joined { address: principal } { block-height: uint })
(define-map map-balance-stx { address: principal } { value: uint})
(define-map map-balance-xBTC { address: principal } { value: uint})
(define-map map-votes-accept-join { address: principal } { value: uint})
(define-map map-votes-reject-join { address: principal } { value: uint})
(define-map map-votes-accept-removal { address: principal } { value: uint})
(define-map map-votes-reject-removal { address: principal } { value: uint})
(define-map map-votes-accept-notifier { address: principal } { value: uint})
(define-map map-votes-reject-notifier { address: principal } { value: uint})
(define-map map-join-request-voter { miner-to-vote: principal, voter: principal } { value: bool})
(define-map map-remove-request-voter { miner-to-vote: principal, voter: principal } { value: bool })
(define-map map-propose-notifier-voter { miner-to-vote: principal, voter: principal } { value: bool })

(define-map map_blacklist { address: principal } { value: bool })

(define-data-var notifier principal tx-sender)
(define-data-var waiting-list (list 100 principal) (list ))
(define-data-var miners-list (list 100 principal) (list (var-get notifier)))
(define-data-var proposed-notifiers-list (list 100 principal) (list ))
(define-data-var pending-accept-list (list 100 principal) (list ))
(define-data-var n uint u1)
(define-data-var k-percentage uint u67)
(define-data-var k uint u0)
(define-data-var k-critical uint u75)
(define-data-var waiting-list-miner-to-remove principal tx-sender) ;; use in remove-principal-miners-list
(define-data-var pending-accept-list-miner-to-remove principal tx-sender)
(define-data-var miners-list-miner-to-remove principal tx-sender)
(define-data-var proposed-notifiers-list-miner-to-remove principal tx-sender)
(define-data-var last-join-done uint u1)
(define-data-var blocks-to-pass uint u100)
(define-data-var miner-to-remove-votes-join principal tx-sender)
(define-data-var miner-to-remove-votes-remove principal tx-sender)
(define-data-var miner-to-remove-votes-notifier principal tx-sender)
(define-data-var proposed-notifier-to-remove-votes principal tx-sender)

(map-set map-is-miner {address: tx-sender} {value: true})
(map-set map-block-asked-to-join {address: tx-sender} {value: u0})

;; at new join -> block height - last-join-done >= 100 !

;; JOINING FLOW

(define-public (ask-to-join (btc-address principal))
(begin 
  (asserts! (not (check-is-miner-now tx-sender)) err-already-joined) 
  (asserts! (not (check-is-waiting-now tx-sender)) err-already-asked-to-join) 
  (map-set map-block-asked-to-join {address: tx-sender} {value: block-height})
  (var-set waiting-list (unwrap-panic (as-max-len? (concat (var-get waiting-list) (list tx-sender)) u100)))
  (map-set map-is-waiting {address: tx-sender} {value: true})
  (ok true)))

(define-public (vote-positive-join-request (miner-to-vote principal))
(begin
  (asserts! (check-is-waiting-now miner-to-vote) err-not-asked-to-join) ;; map_is_waiting
    (asserts! (unwrap! (check-is-miner-when-requested-join miner-to-vote) err-cant-unwrap-check-miner) err-no-vote-permission)
    (asserts! (has-voted-join miner-to-vote) err-already-voted) ;; O(1)
    (map-set map-join-request-voter 
      {miner-to-vote: miner-to-vote, voter: tx-sender} 
      {value: true})
    (if (is-some (get value (map-get? map-votes-accept-join {address: miner-to-vote}))) 
      (map-set map-votes-accept-join {address: miner-to-vote} {value: (+ (unwrap-panic (get value (map-get? map-votes-accept-join {address: miner-to-vote}))) u1)})
      (map-set map-votes-accept-join {address: miner-to-vote} {value: u1}))
    (ok true)))

(define-public (vote-negative-join-request (miner-to-vote principal))
(begin
  (asserts! (check-is-waiting-now miner-to-vote) err-not-asked-to-join)
    (asserts! (unwrap! (check-is-miner-when-requested-join miner-to-vote) err-cant-unwrap-check-miner) err-no-vote-permission)
    (asserts! (has-voted-join miner-to-vote) err-already-voted)    
    (map-set map-join-request-voter 
      {miner-to-vote: miner-to-vote, voter: tx-sender} 
      {value: true})
    (if (is-some (get value (map-get? map-votes-reject-join {address: miner-to-vote}))) 
      (map-set map-votes-reject-join {address: miner-to-vote} {value: (+ (unwrap-panic (get value (map-get? map-votes-reject-join {address: miner-to-vote}))) u1)})
      (map-set map-votes-reject-join {address: miner-to-vote} {value: u1}))  
    (some
      (if (is-vote-rejected-join (unwrap-panic (get value (map-get? map-votes-reject-join {address: miner-to-vote}))) (unwrap-panic (get-k-at-block-asked-to-join miner-to-vote)) (unwrap-panic (get-n-at-block-asked-to-join miner-to-vote)))
        (reject-miner-in-pool miner-to-vote) 
        false))
    (ok true)))

(define-private (accept-miner-in-pool (miner principal)) 
(begin 
  (let ((pending-accept-result (as-max-len? (concat (var-get pending-accept-list) (list miner)) u100)))
  (asserts! (is-some pending-accept-result) err-list-length-exceeded) ;; O(1) 
  (var-set miner-to-remove-votes-join miner)
  (var-set waiting-list (unwrap-panic (as-max-len? (unwrap-panic (remove-principal-waiting-list miner)) u100))) ;; O(N)
  (map-delete map-is-waiting {address: miner})
  (clear-votes-map-join-vote miner)
  (ok (var-set pending-accept-list (unwrap-panic pending-accept-result))))))

(define-private (reject-miner-in-pool (miner principal)) 
(begin 
  (let ((remove-result (unwrap-panic (remove-principal-waiting-list miner))))
    (var-set miner-to-remove-votes-join miner)
    (var-set waiting-list remove-result)
    (map-delete map-is-waiting {address: miner})
    (clear-votes-map-join-vote miner)
    true)))

(define-private (clear-votes-map-join-vote (miner principal)) 
(begin 
  (map-delete map-votes-accept-join {address: (var-get miner-to-remove-votes-join)})
  (map-delete map-votes-reject-join {address: (var-get miner-to-remove-votes-join)})
  (map-delete map-block-asked-to-join {address: (var-get miner-to-remove-votes-join)})
  (map remove-map-record-join-vote (var-get miners-list))))

(define-private (remove-map-record-join-vote (miner principal))
(if (is-some (map-get? map-join-request-voter {miner-to-vote: (var-get miner-to-remove-votes-join), voter: miner})) 
  (map-delete map-join-request-voter {miner-to-vote: (var-get miner-to-remove-votes-join), voter: miner})
  false))

(define-private (is-in-voters-list (miner principal) (voters-list (list 100 principal))) 
(is-some (index-of voters-list miner)))

(define-private (has-voted-join (miner principal)) 
(not (if (is-some (get value (map-get? map-join-request-voter {miner-to-vote: miner, voter: tx-sender})))
          (unwrap-panic (get value (map-get? map-join-request-voter {miner-to-vote: miner, voter: tx-sender})))
          false)))

(define-public (try-enter-pool)
(begin 
  (asserts! (is-some (get value (map-get? map-votes-accept-join {address: tx-sender}))) err-not-asked-to-join)
  (if (is-vote-accepted (unwrap-panic (get value (map-get? map-votes-accept-join {address: tx-sender}))) (unwrap-panic (get-k-at-block-asked-to-join tx-sender)))
    (accept-miner-in-pool tx-sender) 
    (ok false))))

(define-public (add-pending-miners-to-pool) 
(begin
  (let ((len-pending-accept-list (len (var-get pending-accept-list))))
    (asserts! (not (is-eq len-pending-accept-list u0)) err-no-pending-miners)
    (asserts! (x-blocks-passed (var-get blocks-to-pass)) err-more-blocks-to-pass)
    (map add-miner-to-pool (var-get pending-accept-list))
    (asserts! (is-some (as-max-len? (concat (var-get miners-list) (var-get pending-accept-list)) u100)) err-list-length-exceeded)
    (var-set miners-list (unwrap-panic (as-max-len? (concat (var-get miners-list) (var-get pending-accept-list)) u100)))
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

(define-private (get-k-at-block-asked-to-join (miner-to-vote principal)) 
(begin 
  (asserts! (is-some (get value (map-get? map-block-asked-to-join {address: miner-to-vote}))) err-not-asked-to-join)
  (at-block 
    (unwrap-panic 
      (get-block-info? id-header-hash 
        (unwrap-panic 
          (get value 
            (map-get? map-block-asked-to-join {address: miner-to-vote}))))) 
            (ok (var-get k)))))

(define-private (get-n-at-block-asked-to-join (miner-to-vote principal)) 
(begin 
  (asserts! (is-some (get value (map-get? map-block-asked-to-join {address: miner-to-vote}))) err-not-asked-to-join)
  (at-block 
    (unwrap-panic 
      (get-block-info? id-header-hash 
        (unwrap-panic 
          (get value 
            (map-get? map-block-asked-to-join {address: miner-to-vote}))))) 
            (ok (var-get n)))))

;; LEAVING FLOW

(define-public (leave-pool)
(begin 
  (asserts! (check-is-miner-now tx-sender) err-not-in-miner-map)
  (asserts! (not (is-eq (var-get notifier) tx-sender)) err-currently-notifier)
  (let ((remove-result (unwrap-panic (remove-principal-miners-list tx-sender)))
        (new-k-percentage (/ (* (var-get k) u100) (- (var-get n) u2))))
    (some (var-set miners-list remove-result))
    (var-set n (- (var-get n) u1))
    (map-set map-is-miner {address: tx-sender} {value: false})
    (if (>= new-k-percentage (var-get k-critical)) 
      (some (update-threshold))
      none)
    (ok true))))

;; REMOVING FLOW

(define-public (propose-removal (miner-to-remove principal))
(begin 
  (asserts! (not (is-eq (var-get n) u1)) err-cant-remove-when-alone-in-pool)
  (asserts! (check-is-miner-now tx-sender) err-not-in-miner-map) 
  (asserts! (check-is-miner-now miner-to-remove) err-not-in-miner-map-miner-to-remove)
  (asserts! (not (check-is-proposed-for-removal-now miner-to-remove)) err-already-proposed-for-removal) 
  (map-set map-block-proposed-to-remove {address: miner-to-remove} {value: block-height})
  (map-set map-is-proposed-for-removal {address: miner-to-remove} {value: true})
  (ok true)))

(define-public (vote-positive-remove-request (miner-to-vote principal))
(begin
  (asserts! (not (is-eq tx-sender miner-to-vote)) err-cant-vote-himself)
  (asserts! (check-is-proposed-for-removal-now miner-to-vote) err-not-proposed-for-removal) ;; map_is_proposed_for_removal
  (asserts! (is-ok (get-k-at-block-proposed-removal miner-to-vote)) err-not-proposed-for-removal-k-missing)
    (asserts! (unwrap! (check-is-miner-when-requested-remove miner-to-vote) err-cant-unwrap-check-miner) err-no-vote-permission)
    (asserts! (has-voted-remove miner-to-vote) err-already-voted) ;; O(1)
    (map-set map-remove-request-voter 
      {miner-to-vote: miner-to-vote, voter: tx-sender} 
      {value: true})
    (if (is-some (get value (map-get? map-votes-accept-removal {address: miner-to-vote}))) 
      (map-set map-votes-accept-removal {address: miner-to-vote} {value: (+ (unwrap-panic (get value (map-get? map-votes-accept-removal  {address: miner-to-vote}))) u1)})
      (map-set map-votes-accept-removal {address: miner-to-vote} {value: u1}))
    (some
      (if (is-vote-accepted (unwrap-panic (get value (map-get? map-votes-accept-removal {address: miner-to-vote}))) (unwrap-panic (get-k-at-block-proposed-removal miner-to-vote)))
        (process-removal miner-to-vote)
        (ok false)))
    (ok true)))

(define-public (vote-negative-remove-request (miner-to-vote principal))
(begin
  (asserts! (not (is-eq tx-sender miner-to-vote)) err-cant-vote-himself)
  (asserts! (check-is-proposed-for-removal-now miner-to-vote) err-not-proposed-for-removal) ;; map_is_waiting
  (asserts! (is-ok (get-k-at-block-proposed-removal miner-to-vote)) err-not-proposed-for-removal-k-missing)
  (asserts! (unwrap! (check-is-miner-when-requested-remove miner-to-vote) err-cant-unwrap-check-miner) err-no-vote-permission)
  (asserts! (has-voted-remove miner-to-vote) err-already-voted) ;; O(1)
  (map-set map-remove-request-voter 
    {miner-to-vote: miner-to-vote, voter: tx-sender} 
    {value: true})
  (if (is-some (get value (map-get? map-votes-reject-removal {address: miner-to-vote}))) 
    (map-set map-votes-reject-removal {address: miner-to-vote} {value: (+ (unwrap-panic (get value (map-get? map-votes-reject-removal {address: miner-to-vote}))) u1)})
    (map-set map-votes-reject-removal {address: miner-to-vote} {value: u1}))
  (some
    (if (is-vote-rejected-remove (unwrap-panic (get value (map-get? map-votes-reject-removal {address: miner-to-vote}))) (unwrap-panic (get-k-at-block-proposed-removal miner-to-vote)) (unwrap-panic (get-n-at-block-proposed-removal miner-to-vote)))
      (reject-removal miner-to-vote)
      (ok false)))
  (ok true)))

(define-private (process-removal (miner principal))
(begin 
  (let ((remove-result (unwrap-panic (remove-principal-miners-list miner)))
        (new-k-percentage (/ (* (var-get k) u100) (- (var-get n) u2))))
    (some (var-set miners-list remove-result))
    (var-set miner-to-remove-votes-remove miner)
    (var-set n (- (var-get n) u1))
    (map-delete map-is-miner {address: miner})
    (map-set map_blacklist {address: miner} {value: true})
    (clear-votes-map-remove-vote miner)
    (if (>= new-k-percentage (var-get k-critical)) 
      (update-threshold)
      false)
    (ok true))))

(define-private (reject-removal (miner principal))
(begin 
  (var-set miner-to-remove-votes-remove miner)
  (clear-votes-map-remove-vote miner)
  (ok true)))

(define-private (has-voted-remove (miner principal)) 
(not (if (is-some (get value (map-get? map-remove-request-voter {miner-to-vote: miner, voter: tx-sender})))
          (unwrap-panic (get value (map-get? map-remove-request-voter {miner-to-vote: miner, voter: tx-sender})))
          false
  )))

(define-private (clear-votes-map-remove-vote (miner principal)) 
(begin 
  (map-delete map-votes-accept-removal {address: (var-get miner-to-remove-votes-remove)})
  (map-delete map-votes-reject-removal {address: (var-get miner-to-remove-votes-remove)})
  (map-delete map-block-proposed-to-remove {address: (var-get miner-to-remove-votes-remove)})
  (map-delete map-is-proposed-for-removal {address: (var-get miner-to-remove-votes-remove)})
  (map remove-map-record-remove-vote (var-get miners-list))))

(define-private (remove-map-record-remove-vote (miner principal))
(if (is-some (map-get? map-remove-request-voter {miner-to-vote: (var-get miner-to-remove-votes-remove), voter: miner}))
  (map-delete map-remove-request-voter {miner-to-vote: (var-get miner-to-remove-votes-remove), voter: miner})
  false))

(define-private (get-k-at-block-proposed-removal (miner-to-vote principal)) 
(begin 
  (asserts! (is-some (get value (map-get? map-block-proposed-to-remove {address: miner-to-vote}))) err-not-proposed-for-removal)
  (at-block 
    (unwrap-panic 
      (get-block-info? id-header-hash 
        (unwrap-panic 
          (get value 
            (map-get? map-block-proposed-to-remove {address: miner-to-vote}))))) 
            (ok (var-get k)))))

(define-private (get-n-at-block-proposed-removal (miner-to-vote principal)) 
(begin 
  (asserts! (is-some (get value (map-get? map-block-proposed-to-remove {address: miner-to-vote}))) err-not-proposed-for-removal)
  (at-block 
    (unwrap-panic 
      (get-block-info? id-header-hash 
        (unwrap-panic 
          (get value 
            (map-get? map-block-proposed-to-remove {address: miner-to-vote}))))) 
            (ok (var-get n)))))

;; UPDATE NOTIFIER

(define-public (propose-notifier (proposed-notifier principal))
(begin 
  (asserts! (not (is-eq (var-get n) u1)) err-cant-change-notifier)
  (asserts! (not (is-eq (var-get notifier) proposed-notifier)) err-already-notifier)
  (asserts! (check-is-miner-now tx-sender) err-not-in-miner-map) 
  (asserts! (check-is-miner-now proposed-notifier) err-not-in-miner-map-proposed-notifier)
  (asserts! (not (check-is-proposed-for-notifier-now proposed-notifier)) err-already-proposed-for-notifier) 
  (map-set map-block-proposed-notifier {address: proposed-notifier} {value: block-height})
  (map-set map-is-proposed-for-notifier {address: proposed-notifier} {value: true})
  (var-set proposed-notifiers-list (unwrap-panic (as-max-len? (concat (var-get proposed-notifiers-list) (list proposed-notifier)) u100)))
  (ok true)))

(define-public (vote-positive-notifier (miner-to-vote principal))
(begin
  (asserts! (not (is-eq tx-sender miner-to-vote)) err-cant-vote-himself)
  (asserts! (check-is-proposed-for-notifier-now miner-to-vote) err-not-proposed-notifier) ;; map_is_proposed_for_notifier
  (asserts! (is-ok (get-k-at-block-proposed-notifier miner-to-vote)) err-not-proposed-for-notifier-k-missing)
    (asserts! (check-is-miner-now tx-sender) err-no-vote-permission)
    (asserts! (has-voted-notifier miner-to-vote) err-already-voted) ;; O(1)
    (map-set map-propose-notifier-voter 
      {miner-to-vote: miner-to-vote, voter: tx-sender} 
      {value: true})
    (if (is-some (get value (map-get? map-votes-accept-notifier {address: miner-to-vote}))) 
      (map-set map-votes-accept-notifier {address: miner-to-vote} {value: (+ (unwrap-panic (get value (map-get? map-votes-accept-notifier {address: miner-to-vote}))) u1)})
      (map-set map-votes-accept-notifier {address: miner-to-vote} {value: u1}))
    (some
      (if (is-vote-accepted (unwrap-panic (get value (map-get? map-votes-accept-notifier {address: miner-to-vote}))) (unwrap-panic (get-k-at-block-proposed-notifier miner-to-vote)))
        ;; ---HANDLE accepting notifier
        (process-notifier-update miner-to-vote)
        (ok false)))
    (ok true)))

(define-public (vote-negative-notifier (miner-to-vote principal))
(begin
  (asserts! (not (is-eq tx-sender miner-to-vote)) err-cant-vote-himself)
  (asserts! (check-is-proposed-for-notifier-now miner-to-vote) err-not-proposed-notifier) 
  (asserts! (is-ok (get-k-at-block-proposed-notifier miner-to-vote)) err-not-proposed-for-notifier-k-missing)
  (asserts! (check-is-miner-now tx-sender) err-no-vote-permission)
  (asserts! (has-voted-notifier miner-to-vote) err-already-voted) ;; O(1)
  (map-set map-propose-notifier-voter
    {miner-to-vote: miner-to-vote, voter: tx-sender} 
    {value: true})
  (if (is-some (get value (map-get? map-votes-reject-notifier {address: miner-to-vote}))) 
    (map-set map-votes-reject-notifier {address: miner-to-vote} {value: (+ (unwrap-panic (get value (map-get? map-votes-reject-notifier {address: miner-to-vote}))) u1)})
    (map-set map-votes-reject-notifier {address: miner-to-vote} {value: u1}))
      ;; --- HANDLE rejecting proposed notifier 
  (some
    (if (is-vote-rejected-notifier (unwrap-panic (get value (map-get? map-votes-reject-notifier {address: miner-to-vote}))) (unwrap-panic (get-k-at-block-proposed-notifier miner-to-vote)) (unwrap-panic (get-n-at-block-proposed-notifier miner-to-vote)))
      (reject-notifier miner-to-vote)
      (ok false)))
  (ok true)))

(define-private (has-voted-notifier (miner principal)) 
(not (if (is-some (get value (map-get? map-propose-notifier-voter {miner-to-vote: miner, voter: tx-sender})))
          (unwrap-panic (get value (map-get? map-propose-notifier-voter {miner-to-vote: miner, voter: tx-sender})))
          false
  )))

(define-private (process-notifier-update (miner principal))
(begin
    (some (var-set notifier miner))
    (var-set miner-to-remove-votes-notifier miner)
    (map-delete map-is-proposed-for-notifier {address: miner})
    (clear-votes-map-notifier-vote-when-accepted miner)
    (ok true)))

(define-private (clear-votes-map-notifier-vote-when-accepted (miner principal)) 
  ;; ---foreach proposed notifier, set proposed-notifier-to-remove-votes.
(begin 
  ;; ---if only one register, delete for each miner the vote map???
  ;; (map-delete map-votes-accept-notifier {address: (var-get miner-to-remove-votes-notifier)})
  ;; (map-delete map-votes-reject-notifier {address: (var-get miner-to-remove-votes-notifier)})
  ;; (map-delete map-block-proposed-notifier {address: (var-get miner-to-remove-votes-notifier)})
  ;; (map-delete map-is-proposed-for-notifier {address: (var-get miner-to-remove-votes-notifier)})
  (initiate-delete-notifier-voting-info)
  (var-set proposed-notifiers-list (list ))))

(define-private (initiate-delete-notifier-voting-info) 
  ;; ---For the selected notifier, clear votes
  (map remove-votes-notifier-one-miner (var-get proposed-notifiers-list)))

(define-private (remove-votes-notifier-one-miner (one-notifier principal)) 
  ;; ---Delete records foreach miner
(begin 
  (map-delete map-is-proposed-for-notifier {address: one-notifier})
  (map-delete map-block-proposed-notifier {address: one-notifier})
  (map-delete map-votes-accept-notifier {address: one-notifier})
  (map-delete map-votes-reject-notifier {address: one-notifier})
  (var-set proposed-notifier-to-remove-votes one-notifier)
  (map delete-voting-map-one-notifier (var-get miners-list))))

(define-private (delete-voting-map-one-notifier (miner principal)) 
  ;; ---For each miner 
(begin 
  (map-delete map-propose-notifier-voter {miner-to-vote: (var-get proposed-notifier-to-remove-votes), voter: miner})))

(define-private (reject-notifier (miner principal))
(begin 
  (var-set miner-to-remove-votes-remove miner)
  (clear-votes-map-notifier-vote-when-rejected miner)
  (ok true)))

  ;; --- Rejecting update notifier -> delete votes just for one user
(define-private (clear-votes-map-notifier-vote-when-rejected (miner principal)) 
(begin 
  (let ((remove-proposed-notifier-from-list-result (unwrap-panic (remove-principal-proposed-notifiers-list miner))))
  (var-set proposed-notifiers-list remove-proposed-notifier-from-list-result) 
  (map-delete map-votes-accept-notifier {address: (var-get miner-to-remove-votes-notifier)})
  (map-delete map-votes-reject-notifier {address: (var-get miner-to-remove-votes-notifier)})
  (map-delete map-block-proposed-notifier {address: (var-get miner-to-remove-votes-notifier)})
  (map-delete map-is-proposed-for-notifier {address: (var-get miner-to-remove-votes-notifier)})
  (map remove-map-record-notifier-vote-when-rejected (var-get miners-list)))))

(define-private (remove-map-record-notifier-vote-when-rejected (miner principal))
(if (is-some (map-get? map-propose-notifier-voter {miner-to-vote: (var-get miner-to-remove-votes-notifier), voter: miner}))
  (map-delete map-propose-notifier-voter {miner-to-vote: (var-get miner-to-remove-votes-notifier), voter: miner})
  false))

(define-private (get-k-at-block-proposed-notifier (miner-to-vote principal)) 
(begin 
  (asserts! (is-some (get value (map-get? map-block-proposed-notifier {address: miner-to-vote}))) err-not-proposed-notifier)
  (at-block 
    (unwrap-panic 
      (get-block-info? id-header-hash 
        (unwrap-panic 
          (get value 
            (map-get? map-block-proposed-notifier {address: miner-to-vote}))))) 
            (ok (var-get k)))))

(define-private (get-n-at-block-proposed-notifier (miner-to-vote principal)) 
(begin 
  (asserts! (is-some (get value (map-get? map-block-proposed-notifier {address: miner-to-vote}))) err-not-proposed-notifier)
  (at-block 
    (unwrap-panic 
      (get-block-info? id-header-hash 
        (unwrap-panic 
          (get value 
            (map-get? map-block-proposed-notifier {address: miner-to-vote}))))) 
            (ok (var-get n)))))

;; ELECTION FUNCTIONS

(define-private (is-vote-accepted (votes-number uint) (k-local uint))
(if 
  (is-eq k-local u0) ;; k is 0 for n=1, n=2 
    (>= votes-number u1) 
    (>= votes-number k-local)))

(define-private (is-vote-rejected-join (votes-number uint) (k-local uint) (n-local uint))
(if 
  (is-eq n-local u1) 
    (>= votes-number u1) 
    (if (is-eq n-local u2) 
      (>= votes-number u2) 
      (>= votes-number (+ (- n-local k-local) u1)))))


(define-private (is-vote-rejected-remove (votes-number uint) (k-local uint) (n-local uint))
(if (is-eq n-local u2) 
  (>= votes-number u1) 
  (if (is-eq n-local u3)
    (>= votes-number u2)
    (>= votes-number (+ (- n-local k-local) u1)))))

(define-private (is-vote-rejected-notifier (votes-number uint) (k-local uint) (n-local uint))
(if (is-eq n-local u2) 
  (>= votes-number u1) 
  (if (is-eq n-local u3)
    (>= votes-number u2)
    (>= votes-number (+ (- n-local k-local) u1)))))

;; LIST PROCESSING FUNCTIONS

(define-public (remove-principal-waiting-list (miner principal))
(begin
    (var-set waiting-list-miner-to-remove miner) 
    (ok (filter is-principal-in-waiting-list (var-get waiting-list))))) 

(define-public (remove-principal-pending-accept-list (miner principal))
(begin 
    (var-set waiting-list-miner-to-remove miner) 
    (ok (filter is-principal-in-pending-accept-list (var-get pending-accept-list)))))

(define-public (remove-principal-miners-list (miner principal))
(begin
  (var-set miners-list-miner-to-remove miner) 
  (ok (filter is-principal-in-miners-list (var-get miners-list)))))

(define-public (remove-principal-proposed-notifiers-list (miner principal))
(begin
  (var-set proposed-notifiers-list-miner-to-remove miner) 
  (ok (filter is-principal-in-proposed-notifiers-list (var-get proposed-notifiers-list)))))

;; MINER STATUS FUNCTIONS

(define-public (check-is-miner-when-requested-join (miner-to-vote principal))
(ok (if 
  (is-some 
    (at-block (unwrap! (get-block-info? id-header-hash 
      (unwrap! (get value (map-get? map-block-asked-to-join {address: miner-to-vote})) err-cant-unwrap-asked-to-join)) err-cant-unwrap-block-info) 
        (get value (map-get? map-is-miner {address: tx-sender}))))
  (at-block 
    (unwrap! 
      (get-block-info? id-header-hash 
        (unwrap-panic 
          (get value 
            (map-get? map-block-asked-to-join {address: miner-to-vote}))))
            (err u789))
            (unwrap-panic (get value (map-get? map-is-miner {address: tx-sender}))))
  false)))

(define-public (check-is-miner-when-requested-remove (miner-to-vote principal))
(ok (if 
  (is-some 
    (at-block (unwrap! (get-block-info? id-header-hash 
      (unwrap! (get value (map-get? map-block-proposed-to-remove {address: miner-to-vote})) err-cant-unwrap-asked-to-join)) err-cant-unwrap-block-info) 
        (get value (map-get? map-is-miner {address: tx-sender}))))
  (at-block 
    (unwrap! 
      (get-block-info? id-header-hash 
        (unwrap-panic 
          (get value 
            (map-get? map-block-proposed-to-remove {address: miner-to-vote}))))
            (err u795))
            (unwrap-panic (get value (map-get? map-is-miner {address: tx-sender}))))
  false)))

(define-read-only (check-is-miner-when-requested-join-tool-fn (miner-to-vote-address principal)) 
(get value (map-get? map-is-miner {address: tx-sender})))

(define-private (check-is-miner-now (miner principal))
(if (is-some (get value (map-get? map-is-miner {address: miner})))
  (unwrap-panic (get value (map-get? map-is-miner {address: miner})))
  false))

(define-private (check-is-proposed-for-removal-now (miner principal))
(if (is-some (get value (map-get? map-is-proposed-for-removal {address: miner})))
  (unwrap-panic (get value (map-get? map-is-proposed-for-removal {address: miner})))
  false))

(define-private (check-is-proposed-for-notifier-now (miner principal))
(if (is-some (get value (map-get? map-is-proposed-for-notifier {address: miner})))
  (unwrap-panic (get value (map-get? map-is-proposed-for-notifier {address: miner})))
  false))

(define-private (check-is-waiting-now (miner principal))
(if (is-some (get value (map-get? map-is-waiting {address: miner})))
  (unwrap-panic (get value (map-get? map-is-waiting {address: miner})))
  false))

;; READ-ONLY UTILS

;; (define-read-only (check-vote-accepted) ;; to check the vote status inside FE
;; (is-vote-accepted (unwrap-panic (get value (map-get? map-votes-accept-join {address: tx-sender})))))

(define-read-only (get-principals-list (address principal)) 
(map-get? add-lists-principal {address: tx-sender}))

(define-read-only (get-k) 
(var-get k))

(define-read-only (get-notifier) 
(var-get notifier))

(define-read-only (get-waiting-list) 
(var-get waiting-list))

(define-read-only (get-miners-list) 
(var-get miners-list))

(define-read-only (get-proposed-notifiers-list) 
(var-get proposed-notifiers-list))

(define-read-only (get-pending-accept-list) 
(var-get pending-accept-list ))

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

(define-private (is-principal-in-proposed-notifiers-list (miner principal))
(not (is-eq  
  (var-get proposed-notifiers-list-miner-to-remove) 
  miner)))