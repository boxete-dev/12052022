<?php

require_once '../utilities.php';
header("Content-type: text/xml");
echo request('GET', 'https://apiv4.ordering.co/en/boxetekitchen/xml/sitemap', []);

?>