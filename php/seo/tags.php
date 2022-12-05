<?php

require_once __DIR__.'/../utilities.php';
function getTags() {
	$res = null;
	$business = null;
	$product_id = null;
	$category_id = null;
	if (isset($_GET['business'])) {
		$business = urlencode($_GET['business']);
	}
	if (isset($_GET['category'])) {
		$category_id = intval($_GET['category']);
	}
	if (isset($_GET['product'])) {
		$product_id = intval($_GET['product']);
	}
	if ($business && $category_id && $product_id) {
		$res = request('GET', "https://apiv4.ordering.co/en/boxetekitchen/seo/business/{$business}/category/{$category_id}/product/{$product_id}", []);
	} else if ($business && $category_id) {
		$res = request('GET', "https://apiv4.ordering.co/en/boxetekitchen/seo/business/{$business}/category/{$category_id}", []);
	} else if ($business) {
		$res = request('GET', "https://apiv4.ordering.co/en/boxetekitchen/seo/business/{$business}", []);
	} else {
		$res = request('GET', 'https://apiv4.ordering.co/en/boxetekitchen/seo/general', []);
	}
	if ($res) {
		$res = json_decode($res);
		if (!$res->error) return $res->result;
	}
	return $res;
}

?>