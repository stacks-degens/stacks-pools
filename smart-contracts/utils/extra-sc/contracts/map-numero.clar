
;; title: map-numero
;; version:
;; summary:
;; description:


;; constants
;;

(define-map numero { address: principal } { value: uint })

;; data vars
;;

;; data maps
;;

;; public functions
;;
(define-public (set-numero (address principal) (value uint)) 
  (ok (map-set numero {address: address} {value: value})))

;; read only functions
;;
(define-read-only (get-numero (address principal)) 
  (map-get? numero {address: address}))

;; numero for wanted block
(define-read-only (get-numero-block (address principal) (block-picked uint)) 
  (at-block (unwrap-panic (get-block-info? id-header-hash block-picked)) (map-get? numero {address: address})))

(define-read-only (show-hash-block-id (id uint)) 
  (get-block-info? id-header-hash id))

;; (at-block (get-block-info? id-header-hash 0) (var-get data))


;; private functions
;;


