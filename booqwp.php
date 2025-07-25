<?php
/*
Plugin Name: Booqable Modal Overhaul
Plugin URI: https://github.com/HITBZack/booqwp
Description: Overrides Booqable’s default product modal with a modern, responsive one. Designed for timelesspartyrentals.ca.
Version: 1.1.12
Author: Zack (HITBZack)
GitHub Plugin URI: https://github.com/HITBZack/booqwp
Primary Branch: main
*/

defined('ABSPATH') || exit;

// Enqueue styles and scripts
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('bwp-style', plugin_dir_url(__FILE__) . 'css/bwp-style.css');
    //wp_enqueue_script('bwp-script', plugin_dir_url(__FILE__) . 'js/bwp-itempopup.js', [], null, true);
    wp_enqueue_script('bwp-stylefixes', plugin_dir_url(__FILE__) . 'js/bwp-stylefixes.js', [], null, true);
});

// Inject modal template in the footer
add_action('wp_footer', function () {
    if (!is_admin()) {
        include plugin_dir_path(__FILE__) . 'templates/modal-template.php';
    }
});
