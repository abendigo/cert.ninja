#!/usr/bin/env perl

use strict;

my $cmd = shift;


if ($cmd eq 'build') {
  sys(q{rm -rf dist/});
  sys(q{npm run build});
  sys(q{rm dist/*.map});
  sys(q{cp src/verified.png dist/verified.png});
  sys(q{cp extra/* dist/});
} elsif ($cmd eq 'deploy') {
  my $host = shift // 'cert.ninja';
  sys(qq{rsync -cavr --no-t --delete dist/ $host:/var/www/html/});
} else {
  die "no such command: '$cmd'";
}


sub sys {
  my $cmd = shift;
  print "SYS: $cmd\n";
  system($cmd) && die;
}
