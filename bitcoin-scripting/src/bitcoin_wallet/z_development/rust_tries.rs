#[test]
fn last_test() {
    let a = [Some(1), Some(2), Some(3), Some(4), Some(5), None];
    assert_eq!(a.iter().filter(|x| x.is_some()).last(), Some(&Some(5)));
}
