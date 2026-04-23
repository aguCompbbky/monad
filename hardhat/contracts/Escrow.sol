// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract Escrow {
    uint256 public constant DEPOSIT_BPS = 100; // 1%

    enum ListingStatus {
        Created,
        Purchased,
        Completed,
        Cancelled
    }

    struct Listing {
        address seller;
        address buyer;
        uint256 price;
        uint256 deposit;
        bytes32 pinHash;
        ListingStatus status;
    }

    uint256 public listingCount;
    mapping(uint256 => Listing) public listings;

    event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 price, uint256 deposit);
    event ItemPurchased(uint256 indexed listingId, address indexed buyer, uint256 amount);
    event DeliveryConfirmed(uint256 indexed listingId, address indexed buyer, uint256 sellerPayout);

    function createListing(uint256 price, uint256 pinCode) external payable returns (uint256 listingId) {
        require(price > 0, "Price must be greater than zero");
        require(pinCode >= 100000 && pinCode <= 999999, "PIN must be 6 digits");

        uint256 requiredDeposit = (price * DEPOSIT_BPS) / 10000;
        require(msg.value == requiredDeposit, "Invalid deposit amount");

        listingId = ++listingCount;
        listings[listingId] = Listing({
            seller: msg.sender,
            buyer: address(0),
            price: price,
            deposit: msg.value,
            pinHash: keccak256(abi.encodePacked(pinCode)),
            status: ListingStatus.Created
        });

        emit ListingCreated(listingId, msg.sender, price, msg.value);
    }

    function buyItem(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.seller != address(0), "Listing not found");
        require(listing.status == ListingStatus.Created, "Listing not available");
        require(msg.sender != listing.seller, "Seller cannot buy own item");
        require(msg.value == listing.price, "Invalid payment amount");

        listing.buyer = msg.sender;
        listing.status = ListingStatus.Purchased;

        emit ItemPurchased(listingId, msg.sender, msg.value);
    }

    function confirmDelivery(uint256 listingId, uint256 pinCode) external {
        Listing storage listing = listings[listingId];
        require(listing.seller != address(0), "Listing not found");
        require(listing.status == ListingStatus.Purchased, "Listing not in delivery stage");
        require(msg.sender == listing.buyer, "Only buyer can confirm");
        require(keccak256(abi.encodePacked(pinCode)) == listing.pinHash, "Invalid PIN");

        listing.status = ListingStatus.Completed;

        uint256 payout = listing.price + listing.deposit;
        (bool success, ) = listing.seller.call{value: payout}("");
        require(success, "Payout failed");

        emit DeliveryConfirmed(listingId, msg.sender, payout);
    }
}
