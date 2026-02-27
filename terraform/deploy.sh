#!/bin/bash

lambdas=("add_to_pantry" "get_pantry" "mark_as_bought" "mark_expired" "mark_wasted" "delete_pantry_item" "delete_shopping_item" "get_shopping_list" "update_family_info" "generate_shopping_list", "post_confirmation")

for lambda in "${lambdas[@]}"
do
    zip -j lambdas/$lambda.zip src/$lambda.py
done

terraform apply