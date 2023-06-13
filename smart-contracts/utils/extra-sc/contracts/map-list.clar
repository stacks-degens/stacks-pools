
;; title: map-list
;; version:
;; summary:
;; description:

;; traits
;;

;; token definitions
;; 

;; constants
;;

;; data vars
;;

;; data maps
;;

(define-data-var this-num uint u2)
(define-map add-this-lists { address: principal } { values: uint })
(define-data-var this-list (list 23 uint) (list))
(define-map add-lists { address: principal } { values: (list 20 uint)})
(define-map add-lists-principal { address: principal } { values: (list 20 principal)})

(var-set this-num u1 )
(map-set add-this-lists {address: tx-sender} {values:  u23})

(map-set add-lists-principal {address: tx-sender} {values: (list tx-sender tx-sender tx-sender)})

(define-read-only (get-list-principal (address principal)) 
  (map-get? add-lists-principal {address: tx-sender}))

;; (define-public (set-var) 
  ;; (var-set this-list (append (as-max-len? (var-get this-list) u22) (u1 u2 u3 u4))))

;; (var-set this-list (u1 u2 u3))

;; (map-set add-lists {address: tx-sender} (as-max-len? (u1 u2 u3 u4) u20))


