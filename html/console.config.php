<?php
$users = array(
    'admin' => '!July1872!July1872',
);
$realm = 'Console';
$theme = 'ubuntu';
$commands = array(
    'git*' => '/usr/bin/local/git $1',
    'composer*' => '/usr/local/bin/composer $1',
    'symfony*' => './app/console $1',
    '*' => '$1',
);
$allow = array();
$deny = array(
    "rm*",
);
