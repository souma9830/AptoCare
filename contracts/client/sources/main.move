module 0x60d6af926edccae5c6fe975f29691799071bd4bfbc7b208d8dd52d630618cc14::client {
    use std::signer;
    use std::vector;
    use aptos_std::string::{String, utf8};

    struct Record has store, copy, drop {
        client_id: String,
        date: String,
        symptoms: String,
        diagnosis: String,
        treatment: String,
        version: u64,
        previous_version: u64,
        modified_by: address,
        modification_date: u64
    }

    struct RecManager has key {
        records: vector<Record>,
        version_counter: u64
    }

    /// Error codes
    const ENOT_INITIALIZED: u64 = 1;
    const EALREADY_INITIALIZED: u64 = 2;
    const ERECORD_NOT_FOUND: u64 = 3;
    const EINVALID_INDEX: u64 = 4;

    public entry fun create_manager(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Check if manager already exists
        assert!(!exists<RecManager>(account_addr), EALREADY_INITIALIZED);
        
        // Create new manager
        let manager = RecManager {
            records: vector::empty(),
            version_counter: 0
        };
        move_to(account, manager);
    }

    public entry fun add_record(
        account: &signer,
        client_id: String,
        date: String,
        symptoms: String,
        diagnosis: String,
        treatment: String
    ) acquires RecManager {
        let account_addr = signer::address_of(account);
        
        // Check if manager exists
        assert!(exists<RecManager>(account_addr), ENOT_INITIALIZED);
        
        let manager = borrow_global_mut<RecManager>(account_addr);
        let current_version = manager.version_counter;
        manager.version_counter = current_version + 1;
        let now = aptos_std::timestamp::now_seconds();
        
        // Add new record
        vector::push_back(&mut manager.records, Record {
            client_id,
            date,
            symptoms,
            diagnosis,
            treatment,
            version: current_version,
            previous_version: 0, // First version has no previous
            modified_by: account_addr,
            modification_date: now
        });
    }

    public entry fun update_record(
        account: &signer,
        record_index: u64,
        symptoms: String,
        diagnosis: String,
        treatment: String
    ) acquires RecManager {
        let account_addr = signer::address_of(account);
        
        // Check if manager exists
        assert!(exists<RecManager>(account_addr), ENOT_INITIALIZED);
        
        let manager = borrow_global_mut<RecManager>(account_addr);
        assert!(record_index < vector::length(&manager.records), ERECORD_NOT_FOUND);
        
        let current_version = manager.version_counter;
        manager.version_counter = current_version + 1;
        
        // Get the old record
        let old_record = vector::borrow(&manager.records, record_index);
        let now = aptos_std::timestamp::now_seconds();
        
        // Create new version
        let new_record = Record {
            client_id: old_record.client_id,
            date: old_record.date,
            symptoms,
            diagnosis,
            treatment,
            version: current_version,
            previous_version: old_record.version,
            modified_by: account_addr,
            modification_date: now
        };
        
        // Replace the old record
        let record_ref = vector::borrow_mut(&mut manager.records, record_index);
        *record_ref = new_record;
    }

    public entry fun delete_record(
        account: &signer,
        record_index: u64
    ) acquires RecManager {
        let account_addr = signer::address_of(account);
        
        // Check if manager exists
        assert!(exists<RecManager>(account_addr), ENOT_INITIALIZED);
        
        let manager = borrow_global_mut<RecManager>(account_addr);
        
        // Check if record index is valid
        assert!(record_index < vector::length(&manager.records), EINVALID_INDEX);
        
        // Remove the record at the specified index
        vector::remove(&mut manager.records, record_index);
    }

    #[view]
    public fun get_records(account_addr: address): vector<Record> acquires RecManager {
        assert!(exists<RecManager>(account_addr), ENOT_INITIALIZED);
        let manager = borrow_global<RecManager>(account_addr);
        manager.records
    }

    #[view]
    public fun get_record_count(account_addr: address): u64 acquires RecManager {
        assert!(exists<RecManager>(account_addr), ENOT_INITIALIZED);
        let manager = borrow_global<RecManager>(account_addr);
        vector::length(&manager.records)
    }

    #[view]
    public fun get_record_history(account_addr: address, record_index: u64): vector<Record> acquires RecManager {
        assert!(exists<RecManager>(account_addr), ENOT_INITIALIZED);
        let manager = borrow_global<RecManager>(account_addr);
        assert!(record_index < vector::length(&manager.records), ERECORD_NOT_FOUND);
        
        let history = vector::empty();
        let current_record = vector::borrow(&manager.records, record_index);
        let current_version = current_record.version;
        
        // Add current version
        vector::push_back(&mut history, *current_record);
        
        // Find previous versions
        let i = 0;
        while (i < vector::length(&manager.records)) {
            let record = vector::borrow(&manager.records, i);
            if (record.previous_version == current_version) {
                vector::push_back(&mut history, *record);
            };
            i = i + 1;
        };
        
        history
    }
}