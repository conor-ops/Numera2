import UIKit
import Purchases

class PaywallViewController: UIViewController {
    private var tableView: UITableView!
    private var packages: [Package] = []
    private var offerings: Offerings?

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Upgrade"
        view.backgroundColor = .systemBackground
        setupTableView()
        loadOfferings()
    }

    private func setupTableView() {
        tableView = UITableView(frame: view.bounds, style: .insetGrouped)
        tableView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "cell")
        tableView.dataSource = self
        tableView.delegate = self
        view.addSubview(tableView)
    }

    private func loadOfferings() {
        Purchases.shared.getOfferings { [weak self] offerings, error in
            guard let self = self else { return }
            if let error = error {
                self.showError(error)
                return
            }
            self.offerings = offerings
            if let current = offerings?.current {
                self.packages = current.availablePackages
            }
            DispatchQueue.main.async { self.tableView.reloadData() }
        }
    }

    private func purchasePackage(_ package: Package) {
        Purchases.shared.purchasePackage(package) { [weak self] transaction, customerInfo, error, userCancelled in
            guard let self = self else { return }
            if let error = error {
                self.showError(error)
                return
            }
            if userCancelled { return }
            if let info = customerInfo {
                self.handleCustomerInfo(info)
            }
        }
    }

    private func handleCustomerInfo(_ info: CustomerInfo) {
        if let entitlement = info.entitlements["208_fence_and_gate_pro"], entitlement.isActive {
            DispatchQueue.main.async {
                let alert = UIAlertController(title: "Unlocked", message: "208 Fence and Gate Pro enabled", preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: "OK", style: .default))
                self.present(alert, animated: true)
            }
        }
    }

    private func showError(_ error: Error) {
        DispatchQueue.main.async {
            let alert = UIAlertController(title: "Error", message: error.localizedDescription, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            self.present(alert, animated: true)
        }
    }
}

extension PaywallViewController: UITableViewDataSource, UITableViewDelegate {
    func numberOfSections(in tableView: UITableView) -> Int { 1 }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int { packages.count }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "cell", for: indexPath)
        let pkg = packages[indexPath.row]
        let priceString = pkg.product.priceString ?? ""
        cell.textLabel?.text = "\(pkg.packageType.stringValue) — \(priceString)"
        cell.accessoryType = .disclosureIndicator
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        let pkg = packages[indexPath.row]
        purchasePackage(pkg)
    }
}

private extension PackageType {
    var stringValue: String {
        switch self {
        case .monthly: return "Monthly"
        case .annual: return "Yearly"
        case .lifetime: return "Lifetime"
        default: return "Other"
        }
    }
}
