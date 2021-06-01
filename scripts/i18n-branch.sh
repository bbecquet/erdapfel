#!/bin/bash
set -ev

git checkout master
git checkout -f -b i18n-sync
npm run i18n-pull
git commit -am "[I18N] Pull strings from Transifex"
git push -f
if command -v gh
then
  gh pr create -w
fi
