module 0xecab709ca9665a57ef804357cec9475b7fd87d2dcf313cea9b2f34b28578c55a::main {
    use std::signer; use std::vector;

    use aptos_std::string::String;
    use aptos_std::table::{Self, Table};

    struct AccManager has key {
        available: vector<String>,
        assigned: Table<String, String>
    }

    public entry fun create_manager(account: &signer) {
        let acc_manager = AccManager {
            available: vector::empty(), 
            assigned: table::new()
        }; move_to(account, acc_manager);
    }

    public entry fun add_account(
        account: &signer, acc_address: String
    ) acquires AccManager {
        let manager = borrow_global_mut<AccManager>(
            signer::address_of(account));

        vector::push_back(&mut manager
            .available, acc_address);
    }

    public entry fun assign_account(
        account: &signer, client_id: String
    ) acquires AccManager {
        let manager = borrow_global_mut<AccManager>(
            signer::address_of(account));

        table::upsert(&mut manager.assigned, client_id,
            vector::pop_back(&mut manager.available));
    }
}